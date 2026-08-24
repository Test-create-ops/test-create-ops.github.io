import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useUser, useSignIn, useAuth as useClerkAuth } from '@clerk/clerk-react'
import { sb, sendMail, genCode, hashSig, setTokenGetter, type Profile } from '../lib/supabase'

export interface KUser {
  id: string
  email: string
  username: string
  avatar: string
}

interface AuthCtx {
  ready: boolean
  user: KUser | null
  profile: Profile | null
  setProfile: (p: Profile | null) => void
  signInWithGoogle: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
  getToken: () => Promise<string | null>
  requestCert: () => Promise<string | null>
  downloadCert: () => void
  verifyCert: (text: string) => { ok: boolean; why?: string }
  activateCert: () => Promise<string | null>
  logout: () => void
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx)

export function useAuth() {
  return useContext(Ctx)
}

export function certText(p: Profile, email: string): string {
  const body =
    'Name: ' + p.username + '\n' +
    'Email: ' + email + '\n' +
    'Code: ' + p.cert_code + '\n' +
    'Issued: ' + new Date().toISOString().slice(0, 10) + '\n' +
    'Signature: ' + hashSig(p.username + '|' + email + '|' + p.cert_code)
  return (
    '-----BEGIN KAIRO DEVELOPER CERTIFICATE-----\n' +
    body +
    '\n-----END KAIRO DEVELOPER CERTIFICATE-----'
  )
}

async function ensureProfile(user: KUser): Promise<Profile> {
  const uname = user.username || 'user-' + user.id.slice(-6)
  const { data } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (!data) {
    const res = await sb
      .from('profiles')
      .upsert({ id: user.id, username: uname, avatar_url: user.avatar || null })
      .select()
      .single()
    return (res.data as Profile) || { id: user.id, username: uname, avatar_url: user.avatar || null }
  }
  if ((user.username && data.username !== uname) || (user.avatar && data.avatar_url !== user.avatar)) {
    await sb.from('profiles').update({ username: uname, avatar_url: user.avatar }).eq('id', user.id)
    return { ...data, username: uname, avatar_url: user.avatar }
  }
  return data as Profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { signIn } = useSignIn()
  const { getToken, signOut } = useClerkAuth()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    setTokenGetter(() => getToken())
  }, [getToken])

  const kUser: KUser | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        username:
          clerkUser.username ||
          (clerkUser.firstName ? clerkUser.firstName.toLowerCase() : '') ||
          'user-' + clerkUser.id.slice(-6),
        avatar: clerkUser.imageUrl || '',
      }
    : null

  useEffect(() => {
    if (isSignedIn && kUser) {
      ensureProfile(kUser).then(setProfile).catch(() => {})
    } else {
      setProfile(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, kUser?.id])

  const signInWithGoogle = async () => {
    if (!signIn) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: window.location.origin,
        redirectUrlComplete: window.location.origin,
      })
    } catch (ex) {
      console.error(ex)
    }
  }

  const refreshProfile = async (): Promise<Profile | null> => {
    if (!kUser) {
      setProfile(null)
      return null
    }
    const p = await ensureProfile(kUser)
    setProfile(p)
    return p
  }

  const requestCert = async (): Promise<string | null> => {
    if (!kUser || !profile) return 'Non loggato.'
    if (profile.cert_code) return null
    const code = genCode()
    const { error } = await sb.from('profiles').update({ cert_code: code }).eq('id', kUser.id)
    if (error) return error.message
    setProfile({ ...profile, cert_code: code })
    return null
  }

  const downloadCert = () => {
    if (!kUser || !profile) return
    const blob = new Blob([certText(profile, kUser.email)], { type: 'application/octet-stream' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'kairo-certificate-' + profile.username + '.cert'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1500)
  }

  const verifyCert = (text: string): { ok: boolean; why?: string } => {
    if (!kUser || !profile) return { ok: false, why: 'Non loggato.' }
    const m =
      /-----BEGIN KAIRO DEVELOPER CERTIFICATE-----([\s\S]*?)-----END KAIRO DEVELOPER CERTIFICATE-----/.exec(text)
    if (!m) return { ok: false, why: 'Non sembra un certificato Kairo.' }
    const get = (k: string) => {
      const r = new RegExp('^' + k + ':\\s*(.+)$', 'm').exec(m[1])
      return r ? r[1].trim() : ''
    }
    const name = get('Name'),
      mail = get('Email'),
      code = get('Code'),
      sig = get('Signature')
    if (mail !== kUser.email) return { ok: false, why: "Questo certificato appartiene a un'altra email." }
    if (code !== profile.cert_code) return { ok: false, why: 'Il codice nel certificato non è valido.' }
    if (sig !== hashSig(name + '|' + mail + '|' + code)) return { ok: false, why: 'La firma del certificato non è autentica.' }
    return { ok: true }
  }

  const activateCert = async (): Promise<string | null> => {
    if (!kUser || !profile) return 'Non loggato.'
    const { error } = await sb.from('profiles').update({ certified: true }).eq('id', kUser.id)
    if (error) return error.message
    setProfile({ ...profile, certified: true })
    return null
  }

  const logout = () => signOut()

  return (
    <Ctx.Provider
      value={{
        ready: isLoaded,
        user: kUser,
        profile,
        setProfile,
        signInWithGoogle,
        refreshProfile,
        getToken,
        requestCert,
        downloadCert,
        verifyCert,
        activateCert,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

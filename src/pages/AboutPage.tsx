import { Mi } from '../components/Mi'

export default function AboutPage() {
  return (
    <main className="wrap">
      <h1 className="section-title">
        <Mi n="person" />
        About Me
      </h1>
      <div className="card about">
        <img
          className="avatar"
          src="https://cdn.discordapp.com/avatars/1302664272119336978/9bc74ac32002ddd0bde81dfb718d58f6.png?size=256"
          alt="Avatar"
        />
        <div className="aname">Coder &amp;&amp; Unemployed</div>
        <div className="divider" />
        <p className="adesc">
          Ciao, sono uno <b>sviluppatore singolo</b> che costruisce tutto da zero.
          KairoOS, Kairo Store, KairoSDK e questo stesso sito sono nati come
          progetto personale, scritto e mantenuto da una sola persona: <b>io</b>.
          Lavoro su kernel, system programming, toolchain e grafica, un pezzetto
          alla volta, ogni giorno. Se vedi KairoStore funzionare, sappi che dietro
          c'è solo un ragazzo, un editor e tanta passione.
        </p>
      </div>
    </main>
  )
}

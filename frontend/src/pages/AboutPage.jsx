import "../styles/AboutPage.css";
import photo1 from "../assets/PHOTO1.jpg"; 
import photo3 from "../assets/PHOTO3.jpg";
import photo5 from "../assets/PHOTO5.jpg";

export default function AboutPage() {
  return (
    <div className="about-page">
      
      <div className="about-header">
        <h1>O Projekcie TravelMap</h1>
        <p className="subtitle">Cyfrowy pamiętnik dla każdego podróżnika.</p>
      </div>

      <section className="about-section">
        <div className="about-text">
          <h2>Skąd taki pomysł?</h2>
          <p>
            Podróżowanie to nie tylko przemieszczanie się z punktu A do punktu B. 
            To zbiór wspomnień, smaków, zapachów i ludzi, których spotykamy na swojej drodze.
            Często jednak zdjęcia giną w czeluściach telefonu, a nazwy urokliwych knajpek ulatują z pamięci.
          </p>
          <p>
            <strong>TravelMap</strong> powstał z potrzeby uporządkowania tych wspomnień. 
            Chciałem stworzyć miejsce, gdzie mapa łączy się z historią, a każdy punkt 
            kryje za sobą opowieść.
          </p>
        </div>
        <div className="about-image">
          <img src={photo1} alt="Góry i inspiracja" />
        </div>
      </section>

      <section className="about-section reverse">
        <div className="about-text">
          <h2>Technologia "pod maską"</h2>
          <p>
            Projekt ten jest nie tylko pasją podróżniczą, ale też technologiczną. 
            Został zbudowany w oparciu o nowoczesne rozwiązania webowe:
          </p>
          <ul className="tech-list">
            <li>⚛️ <strong>React</strong> – dla dynamicznego interfejsu.</li>
            <li>🗺️ <strong>Leaflet</strong> – interaktywne mapy.</li>
            <li>🎨 <strong>CSS Modules</strong> – responsywny i nowoczesny design.</li>
            <li>⚡ <strong>Vite</strong> – błyskawiczne działanie aplikacji.</li>
          </ul>
          <p>
            Stale rozwijam ten projekt, dodając nowe funkcjonalności, takie jak 
            galerie zdjęć czy planowanie tras.
          </p>
        </div>
        <div className="about-image">
          <img src={photo3} alt="Kodowanie i miasto" />
        </div>
      </section>

      <section className="about-section">
        <div className="about-text">
          <h2>Co dalej?</h2>
          <p>
            To dopiero początek drogi. W przyszłości planuję dodać możliwość 
            udostępniania swoich map znajomym, integrację z mediami społecznościowymi 
            oraz wersję mobilną, która ułatwi dodawanie wpisów prosto z trasy.
          </p>
          <p>
            Dziękuję, że tu jesteś i towarzyszysz mi w tej cyfrowej podróży!
          </p>
        </div>
        <div className="about-image">
          <img src={photo5} alt="Plany na przyszłość" />
        </div>
      </section>

    </div>
  );
}
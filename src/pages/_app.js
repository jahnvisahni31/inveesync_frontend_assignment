// pages/_app.js
import Navbar from '../components/Navbar';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default MyApp;

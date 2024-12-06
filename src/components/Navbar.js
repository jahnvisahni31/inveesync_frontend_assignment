import Link from 'next/link';

const Navbar = () => {
  return (
    <nav style={{
      backgroundColor: '#000',
      padding: '15px 20px',
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      width: '100%',
      top: 0,
      left: 0,
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Home Link */}
        <Link href="/" passHref>
          <span style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.2em',
            fontWeight: 'bold',
            position: 'relative',
            display: 'inline-block',
          }}>
            Home
            <span style={{
              position: 'absolute',
              bottom: '-5px',
              left: '0',
              width: '0',
              height: '2px',
              backgroundColor: '#fff',
              transition: 'width 0.3s',
            }} className="underline"></span>
          </span>
        </Link>

        {/* BoM Page Link */}
        <Link href="/bom" passHref>
          <span style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.2em',
            fontWeight: 'bold',
            position: 'relative',
            display: 'inline-block',
          }}>
            BoM
            <span style={{
              position: 'absolute',
              bottom: '-5px',
              left: '0',
              width: '0',
              height: '2px',
              backgroundColor: '#fff',
              transition: 'width 0.3s',
            }} className="underline"></span>
          </span>
        </Link>

        {/* Items Link */}
        <Link href="/items" passHref>
          <span style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.2em',
            fontWeight: 'bold',
            position: 'relative',
            display: 'inline-block',
          }}>
            Items
            <span style={{
              position: 'absolute',
              bottom: '-5px',
              left: '0',
              width: '0',
              height: '2px',
              backgroundColor: '#fff',
              transition: 'width 0.3s',
            }} className="underline"></span>
          </span>
        </Link>

        {/* Dashboard Link */}
        <Link href="/dashboard" passHref>
          <span style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '1.2em',
            fontWeight: 'bold',
            position: 'relative',
            display: 'inline-block',
          }}>
            Dashboard
            <span style={{
              position: 'absolute',
              bottom: '-5px',
              left: '0',
              width: '0',
              height: '2px',
              backgroundColor: '#fff',
              transition: 'width 0.3s',
            }} className="underline"></span>
          </span>
        </Link>
      </div>

      {/* Inline Styles for Hover Effects */}
      <style jsx>{`
        .underline {
          width: 0;
          transition: width 0.3s;
        }
        span:hover .underline {
          width: 100%;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

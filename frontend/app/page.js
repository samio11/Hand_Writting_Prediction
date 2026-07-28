import DigitCanvas from '../components/DigitCanvas';

export default function Home() {
  return (
    <main className="main-container">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
          Handwriting Digit Predictor
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          FastAPI Backend + Next.js MNIST Recognition
        </p>
      </div>

      <DigitCanvas backendUrl="http://localhost:8000" />
    </main>
  );
}

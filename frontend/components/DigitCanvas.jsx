'use client';

import { useRef, useState, useEffect } from 'react';

export default function DigitCanvas({ backendUrl = 'http://localhost:8000' }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [probabilities, setProbabilities] = useState([]);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    clearCanvas();
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
    setConfidence(null);
    setProbabilities([]);
    setProcessedImage(null);
    setError(null);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handlePredict = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const base64Image = canvas.toDataURL('image/png');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setConfidence(data.confidence);
      setProbabilities(data.probabilities || []);
      setProcessedImage(data.processed_image || null);
    } catch (err) {
      setError('Cannot connect to backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}>
      
      {/* Canvas Section */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '16px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          DRAW DIGIT
        </div>

        <div style={{ margin: '0 auto', width: '280px', height: '280px' }}>
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '16px',
              border: '1px solid #374151',
              cursor: 'crosshair',
              touchAction: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button onClick={clearCanvas} className="btn-secondary">
            Clear
          </button>
          <button onClick={handlePredict} disabled={loading} className="btn-primary">
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Prediction Result Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {prediction !== null ? (
          <div>
            {/* Big Prediction Display */}
            <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
              <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1 }}>
                {prediction}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Confidence: <strong style={{ color: '#10b981' }}>{confidence}%</strong>
              </div>

              {/* 28x28 Thumbnail */}
              {processedImage && (
                <div style={{ position: 'absolute', top: 0, right: 0, textAlign: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={processedImage}
                    alt="28x28"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '6px',
                      border: '1px solid #374151',
                      imageRendering: 'pixelated'
                    }}
                  />
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>28x28</div>
                </div>
              )}
            </div>

            {/* Probability Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {probabilities.map((prob, digit) => {
                const isTop = digit === prediction;
                return (
                  <div key={digit} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <span style={{ width: '12px', color: isTop ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: isTop ? 'bold' : 'normal' }}>
                      {digit}
                    </span>
                    <div className="bar-track">
                      <div className={`bar-fill ${isTop ? 'highlight' : ''}`} style={{ width: `${prob}%` }} />
                    </div>
                    <span style={{ width: '40px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {prob}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✏️</div>
            <p style={{ fontSize: '0.9rem' }}>Draw a number and click <strong>Predict</strong></p>
          </div>
        )}
      </div>

    </div>
  );
}

import './globals.css';

export const metadata = {
  title: 'Handwriting Digit Predictor | FastAPI & Next.js',
  description: 'Deep Learning Model Deployment for MNIST Digit Recognition',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

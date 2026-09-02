import './globals.css';

export const metadata = {
  title: 'Find a Nook',
  description: 'Find and book a study room in seconds.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

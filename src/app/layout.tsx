import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Job Tracker',
  description: 'Track your job applications easily.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

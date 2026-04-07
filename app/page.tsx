import AppWindows from './components/AppViewer/AppWindows';
import Bg from './components/Bg';
import Desktop from './components/Desktop/Index';
import Header from './components/Header';
import Dock from './components/TaskBar';

export default function page() {
  return (
    <div className="relative h-screen w-full">
        <Bg />
        <Desktop />
        <Header />
        <Dock />
        <AppWindows />
    </div>
  )
}
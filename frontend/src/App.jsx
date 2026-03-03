import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from './pages/Auth'
import HomePage from './pages/Landing';
import EditorPage from './pages/Editor';

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path='/editor' element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
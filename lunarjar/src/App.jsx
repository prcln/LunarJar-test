import { useState } from 'react'
import { Routes, Route } from "react-router-dom";

// named export {}
// default export no {}
import WishForm from "../components/wish-form/wish-form.jsx"
import WishRender from "../components/wish-render/wish-render.jsx";
import FormRender from '../pages/form+render.jsx';

//       <Route path="/" element={<>      <WishForm/> <WishRender/> </>} />

function App() {
  return (
    <Routes>
      <Route path="/" element={<FormRender />} />
      <Route path="/form" element={<WishForm />} />
      <Route path="/render" element={<WishRender />} />
      <Route path="/tree/:userId" element={<WishForm />} />
      <Route path="/tree/:userId/wish/:wishId" element={<WishForm />} />
      <Route path="/me/tree" element={<WishForm />} />
    </Routes>
  );
}

export default App;

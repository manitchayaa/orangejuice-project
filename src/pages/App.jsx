// import { useEffect, useState } from 'react'
// import { supabase } from '../service/supabaseClient'

// // รวม route
// function App() {
//   const [addresses, setAddresses] = useState([]);

//   useEffect(() => {
//     getAddresses()
//   }, [])

//   async function getAddresses() {
//     const { data, error } = await supabase
//       .from('Products') // ชื่อตาราง
//       .select('*')            // ดึงทุกฟิลด์
    
//     if (error) {
//       console.error('Error fetching:', error)
//     } else {
//       setAddresses(data)
//       console.log(data)
//     }
//   }
//   console.log("มะมี",addresses)

//   return (
//     <div>
//       {addresses.map(addr => (
//         <div key={addr.id}>
//           <strong>{addr.profile_name}</strong> - {addr.receiver_name}
//         </div>
//       ))}
//     </div>
//   )
// }

// export default App
import { Routes, Route } from "react-router-dom"
import { useEffect ,useState} from "react";
import HomePage from "./HomePage"
import LoginPage from "./AuthPage/Login/LoginPage";

import { supabase } from "../service/supabaseClient";
function App() {

  

  return (
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
    </Routes>
  )
}
export default App;

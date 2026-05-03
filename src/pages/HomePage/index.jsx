import React, { useState, useEffect } from "react";
import { supabase } from "../../service/supabaseClient";

import Appbar from "../../components/Appbar";

// import './OrangeShop.css';
const HomePage = () => {
  const [planetList, setPlanetList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPlanetList();
    getSession();
  }, []);

  async function getSession() {
    let user = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user || null;
    } catch (error) {
      console.error("Error fetching session:", error);
    }
    finally {
      console.log("User session:", user);
    }

  };

  async function getPlanetList() {
    setLoading(false);
    console.log("Hi");
    try {
      const res = await supabase
        .from("Planets")
        .select("*, Authors(author_name:name)")
        .order("created_at", { ascending: true });
        console.log(res.data);
      setPlanetList(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(true);
    }
  }

return (
    <>
      <Appbar />
    </>
  );
};

export default HomePage;

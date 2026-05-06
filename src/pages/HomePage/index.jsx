import React, { useState, useEffect } from "react";
import { supabase } from "../../service/supabaseClient";


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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      user = session?.user || null;
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      console.log("User session:", user);
    }
  }

  async function getPlanetList() {
    setLoading(true);
    console.log("Hi");
    try {
      const res = await supabase
        .from("Planets")
        .select("*, Authors(author_name:name)")
        .order("landing_count", { ascending: false });
      console.log(res.data);
      setPlanetList(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

       <div className="max-w-7xl mx-auto flex-col items-center justify-between px-4 py-6 ">
        <div className="flex justify-between px-4 pt-5">
          <h1 className="text-2xl font-bold ">เรื่องมาแรง & ​​ยอดนิยม</h1>
          <a
            href="/most-popular-planets"
            className="flex items-center justify-center text-gray-500 hover:underline"
          >
            ดูทั้งหมด &gt;
          </a>
        </div>

        <div className="flex px-4 pt-4 gap-2">
          <button className="bg-gray-200 hover:bg-gray-300 cursor-pointer text-black font-normal px-4 py-1 rounded-full">
            มาแรง
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 cursor-pointer text-black font-normal px-4 py-1 rounded-full ">
            ยอดนิยม
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 px-4 pt-4">
          {loading
            ? [...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="w-full h-70 bg-gray-200 dark:bg-gray-700 rounded mb-4 border border-gray-100 dark:border-gray-600"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))
            : planetList.slice(0, 5).map((planet) => (
                <div key={planet.id} className="cursor-pointer">
                  <img
                    src={planet.img_path}
                    alt={planet.name}
                    className="w-full h-70 object-cover rounded mb-4 border border-gray-200 dark:border-gray-600"
                  />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {planet.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    โดย {planet.Authors?.author_name || "ไม่ทราบ"}
                  </p>
                </div>
              ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex-col items-center justify-between px-4 py-6 ">
        <div className="flex justify-between px-4 pt-5">
          <h1 className="text-2xl font-bold ">เรื่องฮิตตามหมวดหมู่</h1>
          <a
            href="/most-popular-planets"
            className="flex items-center justify-center text-gray-500 hover:underline"
          >
            ดูทั้งหมด &gt;
          </a>
        </div>

        <div className="flex px-4 pt-4 gap-2">
          <button className="bg-gray-200 hover:bg-gray-300 cursor-pointer text-black font-normal px-4 py-1 rounded-full">
            โรแมนติก
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 cursor-pointer text-black font-normal  px-4 py-1 rounded-full ">
            แฟนตาซี
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 cursor-pointer text-black font-normal px-4 py-1 rounded-full ">
            สยองขวัญ
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 px-4 pt-4">
          {loading
            ? [...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="w-full h-70 bg-gray-200 dark:bg-gray-700 rounded mb-4 border border-gray-100 dark:border-gray-600"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))
            : planetList.slice(0, 5).map((planet) => (
                <div key={planet.id} className="cursor-pointer">
                  <img
                    src={planet.img_path}
                    alt={planet.name}
                    className="w-full h-70 object-cover rounded mb-4 border border-gray-200 dark:border-gray-600"
                  />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {planet.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    โดย {planet.Authors?.author_name || "ไม่ทราบ"}
                  </p>
                </div>
              ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;

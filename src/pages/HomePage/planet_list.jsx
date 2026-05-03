import React, { useState, useEffect } from "react";
import { supabase } from "../../service/supabaseClient";

import Appbar from "../../components/Appbar";

// import './OrangeShop.css';
const HomePage = () => {
  const [addressProfile, setAddressProfile] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAddressProfile();
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

  async function getAddressProfile() {
    setLoading(false);
    console.log("Hi");
    try {
      const res = await supabase
        .from("Address_Profile")
        .select("*")
        .order("created_at", { ascending: true });
      console.log(res.data);
      setAddressProfile(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(true);
    }
  }

  return (
    <>
      <Appbar />
      <div className="p-4">
        {/* ส่วนควบคุมการแสดงผล Loading */}
        {!loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <div className="relative overflow-x-auto shadow-xl sm:rounded-xl border border-gray-100">
            <table className="w-full text-sm text-left text-gray-600">
              {/* Header: ปรับสีให้เข้มขึ้นและเพิ่มตัวหนา */}
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    Receiver Name
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    Phone Number
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    sub_district
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    district
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    province
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    postal_code
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    note
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {addressProfile && addressProfile.length > 0 ? (
                  addressProfile.map((i) => (
                    <tr
                      key={i.id}
                      className="bg-white hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {i.name}
                      </td>
                      <td className="px-6 py-4">{i.receiver_name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-300">
                          {i.phone_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">{i.sub_district}</td>
                      <td className="px-6 py-4">{i.district}</td>
                      <td className="px-6 py-4">{i.province}</td>
                      <td className="px-6 py-4">{i.postal_code}</td>
                      <td className="px-6 py-4">{i.note}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-gray-400 italic"
                    >
                      ไม่พบข้อมูลที่อยู่
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;

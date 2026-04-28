import supabase from "../service/supabaseClient.js"

function useAddressProfile() {
    
    async function getAddressProfile() {
        const { data, error } = await supabase
         .from("address_profile")
         .select("*")
         .order("create_at", { ascending: true})
        if(error) throw error
        console.log(data)
        return data
    }

    return { getAddressProfile }
}

export default useAddressProfile

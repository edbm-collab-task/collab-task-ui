import { Search } from "lucide-react";


interface Props{

    value:string;

    onChange:(value:string)=>void;

}



export default function TableSearch({
    value,
    onChange
}:Props){


return (

<div className="relative">

<Search
size={18}
className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
/>


<input

value={value}

onChange={(e)=>onChange(e.target.value)}

placeholder="Rechercher..."

className="rounded-lg border px-10 py-2 border-none outline-none focus:ring-2 focus:ring-blue-500"

/>

</div>

);

}
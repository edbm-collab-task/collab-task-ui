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

<div className="relative w-full sm:w-64">

<Search
size={18}
className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary/40"
/>


<input

value={value}

onChange={(e)=>onChange(e.target.value)}

placeholder="Rechercher..."

className="h-10 w-full rounded-xl border border-secondary/60 bg-secondary/20 pl-10 pr-4 text-sm text-primary outline-none transition placeholder:text-primary/40 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"

/>

</div>

);

}
import GlobalForms from "@/components/form/GlobalForm";
import {directionFormField} from "@/components/direction/directionForm"
import type {DirectionReq} from "@/types/direction"
import {directionService} from "@/services/direction/direction.service"
import { useNavigate } from "react-router";


export default function createDirection(){

    const navigate = useNavigate();

    const handleCreateDirection = async (data: DirectionReq) => {

        try {

            const createdDirection = await directionService.create(data);

            console.log("Direction created :", createdDirection);

            navigate("/admin/directions");

            console.log("Navigation exécutée");

        } catch (error) {

            console.error("Create Direction failed :", error);

        }
    };

    return (
            <div className="mx-auto mt-10">
    
                <GlobalForms<DirectionReq>
                    title="Créer une direction"
                    fields={directionFormField}
                    onSubmit={handleCreateDirection}
                    submitLabel="Créer"
                />
    
            </div>
        );
    }

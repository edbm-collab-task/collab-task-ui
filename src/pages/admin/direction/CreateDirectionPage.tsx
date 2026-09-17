import GlobalForms from "@/components/Form/GlobalForm";
import {directionFormField} from "@/components/direction/directionForm"
import type {DirectionReq} from "@/types/direction"
import {directionService} from "@/services/direction/direction.service"
import { useNavigate } from "react-router";


export default function CreateDirectionPage(){

    const navigate = useNavigate();

    const handleCreateDirection = async (data: DirectionReq) => {

        try {

            await directionService.create(data);

            navigate("/admin/directions");

        } catch (error) {

            console.error("Create Direction failed :", error);

        }
    };

    return (
            <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
    
                <GlobalForms<DirectionReq>
                    title="Créer une direction"
                    fields={directionFormField}
                    onSubmit={handleCreateDirection}
                    submitLabel="Créer"
                />
    
            </div>
        );
    }

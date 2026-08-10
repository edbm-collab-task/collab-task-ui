export interface DirectionReq{
    name: string ;
}

export interface DirectionRes{
    directionId: number ;
    name: string ;
}

export const directionTr = {

    directionId: "ID",

    name: "Nom",


} as const;
import type { NextFunction, Request, RequestHandler, Response } from "express";

const tryCatch = (handler: RequestHandler) : RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction)=> {
        try{
            await handler(req, res, next);
        }catch(error : any){
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error
            })
        }
    }
}

export default tryCatch;
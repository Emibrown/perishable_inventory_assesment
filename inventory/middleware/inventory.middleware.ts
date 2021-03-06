import express from 'express';
import moment from 'moment';
import InventoryService from '../services/inventory.service';

import debug from 'debug';

const log: debug.IDebugger = debug('app:users-controller');
class InventoryMiddleware {
    
    async extractItem(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        req.body.name = req.params.item;
        next();
    }

    async validateRequiredAddItemBodyFields(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const {quantity,expiry} = req.body
        if (req.body && quantity && expiry) {
            if (typeof quantity === 'number' && typeof expiry === 'number') {
                next();
            }else{
                res.status(400).send({
                    error: `Invalied data`,
                });
            }
        } else {
            res.status(400).send({
                error: `Missing required fields`,
            });
        }
    }

    async checkForQuantity(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        try{
            const {name,quantity} = req.body
            if (typeof quantity === 'number') {
                const item = await InventoryService.itemQuantity(name)
                if(item.quantity){
                    const itemQuantity = item.quantity
                    if(itemQuantity < quantity){
                        res.status(400).send({
                            error: `Quantity exceed available quantity`,
                        });
                    }else{
                        next()
                    }
                }else{
                    res.status(400).send({
                        error: `Item not available or expired`,
                    });
                }
            }else{
                res.status(400).send({
                    error: `Quantity most be a number`,
                });
            }
        }catch(e){
            res.status(400).send({
                error: `error`,
            });
        }
    }


    async checkForExpiriedItem(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const todayDate = moment();
        const itemDate = moment(req.body.expiry);
        const dDiff = itemDate.diff(todayDate);
        if (dDiff > 0) {
            next();
        }else{
            res.status(400).send({
                error: `Item already expiried`,
            });
        }

        // const date = new Date()
        // const todayDate = date.getTime()
        // const itemDate = req.body.expiry;

        // if (todayDate < itemDate) {
        //     next();
        // }else{
        //     res.status(400).send({
        //         error: `Item already expiried`,
        //     });
        // }
        
    }
    

}

export default new InventoryMiddleware();
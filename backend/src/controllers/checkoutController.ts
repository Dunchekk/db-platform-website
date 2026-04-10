import type { Request, Response } from "express";

class CheckoutController {
  async createOrder(req: Request, res: Response) {}
}

export const checkoutController = new CheckoutController();

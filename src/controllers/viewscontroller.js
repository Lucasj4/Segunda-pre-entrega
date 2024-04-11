import ProductModel from "../models/productmodel.js";
import { CartService } from "../services/cartservice.js";
const cartService= new CartService();

export class ViewController{
    async renderProducts(req, res) {
        try {
            const { page = 1, limit = 3 } = req.query;
           
            const skip = (page - 1) * limit;

            const products = await ProductModel
                .find()
                .skip(skip)
                .limit(limit);

            const totalProducts = await ProductModel.countDocuments();

            const totalPages = Math.ceil(totalProducts / limit);

            const hasPrevPage = page > 1;
            const hasNextPage = page < totalPages;
           
            const cartId = req.user.user.cart;
            console.log(cartId);

            const newArray = products.map(producto => {
                const { _id, ...rest } = producto.toObject();
                return { id: _id, ...rest }; 
            });

           
     

            res.render("products", {
                products: newArray,
                hasPrevPage,
                hasNextPage,
                prevPage: page > 1 ? parseInt(page) - 1 : null,
                nextPage: page < totalPages ? parseInt(page) + 1 : null,
                currentPage: parseInt(page),
                totalPages,
                cartId,
               
            });

        } catch (error) {
            console.error("Error al obtener productos", error);
            res.status(500).json({
                status: 'error',
                error: "Error interno del servidor"
            });
        }
    }

    async renderLogin(req, res){
        res.render("login");
    }

    async renderRegister(req, res) {
        res.render("register");
    }

    async renderRealTimeProducts(req, res) {
        try {
            res.render("realtimeproducts");
        } catch (error) {
            console.log("error en la vista real time", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async renderChat(req, res) {
        res.render("chat");
    }

    async renderHome(req, res) {
        res.render("home");
    }

    async renderCart(req, res) {
        const cartId = req.params.cid;
       
        try {
            const cart = await cartService.getProductsFromCart(cartId);
            console.log(cart);
            if (!cart) {
                console.log("No existe ese carrito con el id");
                return res.status(404).json({ error: "Carrito no encontrado" });
            }
           
            let purchaseTotal = 0;
    
            const cartProducts = cart.products.map(item => {
                const product = item.product.toObject();
                const quantity = item.quantity || 1 ;
                const totalPrice = product.price * quantity;
                
                purchaseTotal += totalPrice;
          
                return {
                    product: { ...product, totalPrice },
                    quantity,
                    cartId
                };

               
            });
            
            res.render("carts", { products: cartProducts, purchaseTotal, cartId });
        } catch (error) {
            console.error("Error al obtener el carrito desde render", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}
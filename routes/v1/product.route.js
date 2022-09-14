const express = require("express");
const productControllers = require("../../controllers/product.controller");
const limiter = require("../../middleware/limiter");
const viewCount = require("../../middleware/viewCount");

const router = express.Router();

// router.get("/", (req, res) => {
//   res.send("tools found with id");
// });

// router.post("/", (req, res) => {
//   res.send("tool added");
// });

router
  .route("/")
  /**
   * @api {get} /product All products
   * @apiDescription Get all the products
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [limit=10]  Users per page
   *
   * @apiSuccess {Object[]} all the products.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(productControllers.getAllProduct)
  /**
   * @api {post} /product save a  product
   * @apiDescription add a product
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [limit=10]  Users per page
   *
   * @apiSuccess {Object[]} a product.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .post(productControllers.saveAProduct);

router
  .route("/:id")
  .get(viewCount, limiter, productControllers.getProductDetail);

module.exports = router;

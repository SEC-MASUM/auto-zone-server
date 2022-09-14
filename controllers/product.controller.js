module.exports.getAllProduct = (req, res, next) => {
  const { ip, query, params, body, headers } = req;
  console.log(ip, query, params, body, headers);

  // res.download(__dirname + "/product.controller.js");
  // res.json({ name: "abc" });
  // res.redirect("/login");
  res.send("tools found");
};

module.exports.saveAProduct = (req, res, next) => {
  res.send("tool added");
};

module.exports.productDetail = (req, res, next) => {
  res.send("Product Detail Found");
};

// module.exports = {
//   getAllTools,
// };

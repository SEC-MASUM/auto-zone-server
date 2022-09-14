const products = [
  { id: 1, name: "wheel" },
  { id: 2, name: "brake" },
  { id: 3, name: "brake2" },
  { id: 4, name: "mirror" },
  { id: 5, name: "mirror2" },
  { id: 6, name: "mirror" },
  { id: 7, name: "mirror" },
  { id: 8, name: "mirror" },
  { id: 9, name: "mirror" },
  { id: 10, name: "mirror" },
  { id: 11, name: "mirror" },
  { id: 12, name: "mirror" },
  { id: 13, name: "mirror" },
  { id: 14, name: "mirror" },
];

module.exports.getAllProduct = (req, res, next) => {
  const { limit, page } = req.query;
  console.log(limit, page);
  res.json(products.slice(0, limit - 1));
};

module.exports.saveAProduct = (req, res) => {
  console.log(req.body);
  products.push(req.body);
  res.send(products);
};

module.exports.getProductDetail = (req, res) => {
  const { id } = req.params;
  console.log(id);
  // const filter = { _id: id };
  const foundProduct = products.find(
    (product) => product.id === Number.parseInt(id)
  );
  res.send(foundProduct);
};

// module.exports = {
//   getAllTools,
// };

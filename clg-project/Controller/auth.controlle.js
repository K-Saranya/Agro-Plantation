const Model = require("../models")
const authController = Model.auth
const bcrypt = require("bcryptjs");
const  jwt = require("jsonwebtoken")
const secret = "4641316895";

const login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    await authController.findAll({ where: { email: email } })
      .then(async (data) => {
        if (data.length == 0) {
          res.json({
            status: 400,
            message: "Please Register...",
          });
        } else {
          let passwordresult = await bcrypt.compare(password, data[0].password);
          if (passwordresult == true) {
            let token = jwt.sign({ id: data[0].id }, secret, {
              expiresIn: "24hr",
            });
            await authController.update(
              { token: token },
              {
                where: {
                  id: data[0].id,
                },
              }
            );
            await authController.findAll({
              attributes: { exclude: ["password"] },
              where: { email: email },
            }).then(async (Admindata) => {
              res.json({
                status: 200,
                message: "SUCCESS",
                data: { token, Admindata },
              });
            });
          } else {
            res.json({
              status: 400,
              message: "Wrong Password.. Please Check",
            });
          }
        }
      })
      .catch((err) => {
        res.json({
          status: 400,
          message: err.message,
        });
      });
  } catch (error) {
    res.json({
      status: 400,
      message: err.message,
    });
  }
};


const addNew = async (req, res) => {
    try {
      const data = req.body;
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(req.body.password, salt);
      data["password"] = hash;
      await authController.findAll({
        where: { email: req.body.email },
      }).then(async (Admindata) => {
        if (Admindata.length === 0) {
          await authController.create(data)
            .then(async (data) => {
              let token = jwt.sign({ id: data.id }, secret, {
                expiresIn: "24h",
              });
              await authController.update(
                { token: token },
                {
                  where: {
                    id: data.id,
                  },
                }
              )
                .then(() => {
                  res.json({
                    status: 200,
                    message: "SUCCESS",
                    data: { id: data.id, token: token },
                  });
                })
                .catch((err) => {
                  res.json({
                    status: 400,
                    message: err.message,
                  });
                });
            })
            .catch((err) => {
              res.json({
                status: 400,
                message: err.message,
              });
            });
        } else {
          res.json({
            status: 400,
            message: "This email already has an account",
          });
        }
      });
    } catch (error) {
      res.json({
        status: 400,
        message: error.message,
      });
    }
  };
  
const viewAll = async(req,res)=>{
    try {
        const data = await authController.findAll();
        res.send(data);
    } catch (error) {
        res.send(error);
    }
}
const viewById= async(req,res)=>{
    try {
        const {id}=req.params
        const data = await authController.findOne({
            where:{id:id},
        })
        res.send(data);
    } catch (error) {
        res.send(error);
    }
}
const updateById = async(req,res)=>{
    try {
        const {id}=req.params
        const data = await authController.update(req.body,{
            where:{id:id},
        })
        res.send(data);
    } catch (error) {
        res.send(error);
    }
}
const deleteById = async(req,res)=>{
    try {
        const {id}=req.params;
        await authController.destroy({
            where:{id:id},
        })
        res.send("deleted successfully")
    } catch (error) {
        res.send(error);
    }
}

  
  const updatePassword = async (req, res) => {
    try {
      const value = req.body;
      const id = req.body.id;
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(req.body.password, salt);
      value["password"] = hash;
  
      await authController.update(value, {
        where: {
          id: id,
        },
      })
        .then(() => {
          res.json({
            status: 200,
            message: "Updated Successfully",
          });
        })
        .catch((err) => {
          res.json({
            status: 400,
            message: err.message,
          });
        });
    } catch (error) {
      res.json({
        status: 400,
        message: error.message,
      });
    }
  };

module.exports={
    addNew,
    viewAll,
    viewById,
    updateById,
    deleteById,
    login,
    updatePassword
}
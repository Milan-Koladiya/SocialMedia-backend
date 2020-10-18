const jwt = require("jsonwebtoken");
const model = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const btoken = req.header("authorization");
    if (!btoken) {
      return res.status(401).json({ error: "Please logi first" });
    }
    const token = btoken.replace("Bearer ", "");
    const vtoken = await jwt.verify(token, "thisistoken");
    if (!vtoken) {
      return res.status(400).send("invalid token");
    }
    const user = await model.findOne({ _id: vtoken._id });
    if (!user) {
      return res.status(400).json({ error: "invalid user" });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "please login first" });
  }
};

const mapStateToProps = (state) => {
  return {
    mypost: state.myPostReducer.mypost,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    myPostGet: (mypost) => dispatch(myPostGet(mypost)),
  };
};

module.exports = auth;

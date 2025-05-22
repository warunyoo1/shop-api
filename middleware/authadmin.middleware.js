const jwt = require('jsonwebtoken');
const config = require('../config/config');


const isUser = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({
            message: "ไม่พบ token กรุณาเข้าสู่ระบบ"
        });
    }
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwt.secret);
        req.user = decoded;
        
        // ตรวจสอบ role
        if (req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.role === 'user') {
            next();
        } else {
            return res.status(403).json({
                message: "ไม่มีสิทธิ์เข้าถึง"
            });
        }
    } catch (err) {
        return res.status(401).json({
            message: "Token ไม่ถูกต้องหรือหมดอายุ"
        });
    }
}

const isAdmin = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
   
    if (!token) {
        return res.status(403).json({
            message: "ไม่พบ token กรุณาเข้าสู่ระบบ"
        });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwt.secret);
        req.user = decoded;
        // ตรวจสอบ role
        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            next();
        } else {
            return res.status(403).json({
                message: "ไม่มีสิทธิ์เข้าถึง"
            });
        }
    } catch (err) {
        return res.status(401).json({
            message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ"
        });
    }
};

module.exports = {
    isAdmin,
    isUser
}; 
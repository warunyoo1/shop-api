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


const isMaster = (req, res, next) => {
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
        if (req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.role === 'master') {
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

// เช็ค mangagersuperadmin
const permissionmanagersuperadmin = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
        return res.status(403).json({
            message: "ไม่พบ token กรุณาเข้าสู่ระบบ"
        });
    }
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwt.secret);
        req.user = decoded;
        // เช็ค role ก่อน ถ้าเป็น superadmin  สามารถเข้าถึงได้ 
        if(req.user.role === 'superadmin'){
            next();
        }else if(req.user.role === 'admin'){
            // ให้เช็ค premission
            const permission = req.user.premission;
            if( ( Array.isArray(permission) && permission.length > 0 && permission[0].managersuperadmin === "1")){
                next();
            }else{
                return res.status(403).json({
                    message: "ไม่มีสิทธิ์เข้าถึง"
                });
            }
        }else{
            return res.status(403).json({
                message: "ไม่มีสิทธิ์เข้าถึง"
            });
        }
       
    }catch(err){
        return res.status(401).json({
            message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ"
        });
    }
}
// เช็ค manageradmin
const permissionmanageradmin = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: "ไม่พบ token กรุณาเข้าสู่ระบบ" });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwt.secret);
        req.user = decoded;

        if (req.user.role === 'superadmin') {
            return next();
        } else if (req.user.role === 'admin') {
            const permission = req.user.premission;
            if (Array.isArray(permission) && permission.length > 0 && permission[0].manageradmin === "1") {
                return next();
            } else {
                return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
            }
        } else {
            return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
        }
    } catch (err) {
        return res.status(401).json({ message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ" });
    }
};

// เช็ค  managermaster
const permissionmanagermaster = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: "ไม่พบ token กรุณาเข้าสู่ระบบ" });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwt.secret);
        req.user = decoded;

        if (req.user.role === 'superadmin') {
            return next();
        } else if (req.user.role === 'admin') {
            const permission = req.user.premission;
            if (Array.isArray(permission) && permission.length > 0 && permission[0].managermaster === "1") {
                return next();
            } else {
                return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
            }
        } else {
            return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
        }
    } catch (err) {
        return res.status(401).json({ message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ" });
    }
};

// เช็ค lotterytype
const permissionlotterytype = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: "ไม่พบ token กรุณาเข้าสู่ระบบ" });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwt.secret);
        req.user = decoded;

        if (req.user.role === 'superadmin') {
            return next();
        } else if (req.user.role === 'admin') {
            const permission = req.user.premission;
            if (Array.isArray(permission) && permission.length > 0 && permission[0].lotterytype === "1") {
                return next();
            } else {
                return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
            }
        } else {
            return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
        }
    } catch (err) {
        return res.status(401).json({ message: err.message || "Token ไม่ถูกต้องหรือหมดอายุ" });
    }
};


module.exports = {
    isAdmin,
    isUser,
    isMaster,
    permissionmanagersuperadmin,
    permissionmanageradmin,
    permissionmanagermaster,
    permissionlotterytype
}; 
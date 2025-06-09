const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
const masterService = require("../../service/master/master.service");

// เพิ่ม master
exports.createMaster = async (req, res) => {
    try {
        const { error } = validate.masterValidate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { username, email, password, phone, commission_percentage } = req.body;
        const result = await masterService.createMaster(username, email, password, phone, commission_percentage);

        if (result.error) {
            return res.status(400).json(result);
        }

        // await logAction(req.user.id, 'CREATE_MASTER', `Created master: ${username}`, normalizeIP(req.ip));
        return res.status(201).json({
            code: 201,
            status: "success",
            message: "Master created successfully",
            master: result.data,
        });
    } catch (error) {
        console.error('Create master error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ดึงข้อมูล master
exports.getAllMasters = async (req, res) => {
    try {
        const { page, perPage, search } = req.query;
        const result = await masterService.getAllMasters({ page, perPage, search });
        return res.status(200).json({
            status: "success",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error('Get all masters error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ดึงข้อมูล master ตาม id
exports.getMasterById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await masterService.getMasterById(id);

        if (result.error) {
            return res.status(404).json(result);
        }

        return res.status(200).json({
            status: "success",
            data: result.data,
        });
    } catch (error) {
        console.error('Get master by id error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// อัพเดตข้อมูล master
exports.updateMaster = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = validate.masterValidate(req.body);
        
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const result = await masterService.updateMaster(id, req.body);

        if (result.error) {
            return res.status(404).json(result);
        }

        //await logAction(req.user.id, 'UPDATE_MASTER', `Updated master: ${id}`, normalizeIP(req.ip));
        return res.status(200).json({
            status: "success",
            data: result.data,
        });
    } catch (error) {
        console.error('Update master error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ลบข้อมูล master
exports.deleteMaster = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await masterService.deleteMaster(id);

        if (result.error) {
            return res.status(404).json(result);
        }

       // await logAction(req.user.id, 'DELETE_MASTER', `Deleted master: ${id}`, normalizeIP(req.ip));
        return res.status(200).json({
            status: "success",
            data: result.data,
        });
    } catch (error) {
        console.error('Delete master error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// active master
exports.activateMaster = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await masterService.activateMaster(id);

        if (result.error) {
            return res.status(404).json(result);
        }

       // await logAction(req.user.id, 'ACTIVATE_MASTER', `Activated master: ${id}`, normalizeIP(req.ip));
        return res.status(200).json({
            status: "success",
            data: result.data,
        });
    } catch (error) {
        console.error('Activate master error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// disactive master
exports.deactivateMaster = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await masterService.deactivateMaster(id);

        if (result.error) {
            return res.status(404).json(result);
        }

        //await logAction(req.user.id, 'DEACTIVATE_MASTER', `Deactivated master: ${id}`, normalizeIP(req.ip));
        return res.status(200).json({
            status: "success",
            data: result.data,
        });
    } catch (error) {
        console.error('Deactivate master error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ดึงข้อมูล customer ที่สมัครผ่าน master
exports.getCustomerByMaster = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await masterService.getCustomerByMaster(id);
        return res.status(200).json({
            status: "success",
            data: result.data,
        });
    } catch (error) {
        console.error('Get customer by master error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
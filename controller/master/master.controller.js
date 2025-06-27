const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
const masterService = require("../../service/master/master.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

// เพิ่ม master
exports.createMaster = async (req, res) => {
  try {
    const { error } = validate.masterValidate(req.body);
    if (error) {
      const response = await handleError(error, error.details[0].message, 400);
      return res.status(response.status).json(response);
    }

    const { username, password, phone, commission_percentage } = req.body;
    const result = await masterService.createMaster(
      username,
      password,
      phone,
      commission_percentage
    );

    if (!result.success) {
      return res.status(result.status).json(result);
    }

    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

exports.redirectById = async (id) => {
  try {
    const master = await masterService.findById(id);
    if (!master) {
      return handleError(null, "Master not found", 404);
    }
    return handleSuccess(
      { profileUrl: master.profileUrl },
      "Redirect success",
      200
    );
  } catch (error) {
    return handleError(error);
  }
};

exports.getBySlug = async (slug) => {
  try {
    const master = await masterService.findOne({ slug });
    if (!master) {
      return handleError(null, "Master not found", 404);
    }
    return handleSuccess(
      {
        id: master._id,
        username: master.username,
        slug: master.slug,
        profileUrl: master.profileUrl,
      },
      "Fetch Master success",
      200
    );
  } catch (error) {
    return handleError(error);
  }
};

// ดึงข้อมูล master
exports.getAllMasters = async (req, res) => {
  try {
    const { page, perPage, search } = req.query;
    const result = await masterService.getAllMasters({ page, perPage, search });
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// ดึงข้อมูล master ตาม id
exports.getMasterById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await masterService.getMasterById(id);
    if (!result.success) {
      return res.status(result.status).json(result);
    }

    const master = result.data;
    const response = {
      id: master._id,
      username: master.username,
      phone: master.phone,
      commission_percentage: master.commission_percentage,
      active: master.active,
      createdAt: master.createdAt,
      updatedAt: master.updatedAt,
    };

    return res.status(200).json({
      success: true,
      data: response,
      message: "ดึงข้อมูล Master สำเร็จ",
    });
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// อัพเดตข้อมูล master
exports.updateMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = validate.masterValidate(req.body);

    if (error) {
      const response = await handleError(error, error.details[0].message, 400);
      return res.status(response.status).json(response);
    }

    const result = await masterService.updateMaster(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// ลบข้อมูล master
exports.deleteMaster = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await masterService.deleteMaster(id);
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// active master
exports.activateMaster = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await masterService.activateMaster(id);
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// disactive master
exports.deactivateMaster = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await masterService.deactivateMaster(id);
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// ดึงข้อมูล customer ที่สมัครผ่าน master
exports.getCustomerByMaster = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await masterService.getCustomerByMaster(id);
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

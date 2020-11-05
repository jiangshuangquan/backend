'use strict';
const Service = require('egg').Service;

class UserService extends Service {
  /**
   * 创建用户
   * @param {*} payload 创建对象
   */
  async create(payload) {
    const { ctx } = this;
    payload.password = await this.ctx.genHash(payload.password);
    return ctx.model.User.create(payload);
  }

  /**
   * 删除用户
   * @param {*} _id 用户id
   */
  async destroy(_id) {
    const { ctx } = this;
    const user = await this.ctx.service.user.find(_id);
    if (!user) {
      ctx.throw(404, 'user not found');
    }
    return ctx.model.User.findByIdAndRemove(_id);
  }

  /**
   * 修改用户
   * @param {*} _id 用户id
   * @param {*} payload 创建对象
   */
  async update(_id, payload) {
    const { ctx } = this;
    const user = await ctx.service.user.find(_id);
    if (!user) {
      ctx.throw(404, 'user not found');
    }
    return ctx.model.User.findByIdAndUpdate(_id, payload);
  }

  /**
   * 查看单个用户
   * @param {*} _id 用户id
   */
  async show(_id) {
    const user = await this.ctx.service.user.find(_id);
    if (!user) {
      this.ctx.throw(404, 'user not found');
    }
    return this.ctx.model.User.findById(_id).populate('role');
  }

  /**
   * 查看用户列表
   * @param {*} payload 查看用户条件
   */
  async index(payload) {
    const { currentPage, pageSize, isPaging, search } = payload;
    let res = [];
    let count = 0;
    const skip = ((Number(currentPage)) - 1) * Number(pageSize || 10);
    if (isPaging) {
      if (search) {
        res = await this.ctx.model.User.find({ mobile: { $regex: search } }).populate('role').skip(skip)
          .limit(Number(pageSize))
          .sort({ createdAt: -1 })
          .exec();
        count = res.length;
      } else {
        res = await this.ctx.model.User.find({}).populate('role').skip(skip)
          .limit(Number(pageSize))
          .sort({ createdAt: -1 })
          .exec();
        count = await this.ctx.model.User.count({}).exec();
      }
    } else {
      if (search) {
        res = await this.ctx.model.User.find({ mobile: { $regex: search } }).populate('role').sort({ createdAt: -1 })
          .exec();
        count = res.length;
      } else {
        res = await this.ctx.model.User.find({}).populate('role').sort({ createdAt: -1 })
          .exec();
        count = await this.ctx.model.User.count({}).exec();
      }
    }
    // 整理数据源 -> Ant Design Pro
    const data = res.map((e, i) => {
      const jsonObject = Object.assign({}, e._doc);
      jsonObject.key = i;
      jsonObject.password = 'Are you ok?';
      jsonObject.createdAt = this.ctx.helper.formatTime(e.createdAt);
      return jsonObject;
    });

    return { count, list: data, pageSize: Number(pageSize), currentPage: Number(currentPage) };
  }

  /**
   * 删除多个用户
   * @param {*} payload 参数
   */
  async removes(payload) {
    return this.ctx.model.User.remove({ _id: { $in: payload } });
  }

  /**
   * 根据手机号查找
   * @param {*} mobile 手机号
   */
  async findByMobile(mobile) {
    return this.ctx.model.User.findOne({ mobile });
  }

  /**
   * 查找用户
   * @param {*} id 用户
   */
  async find(id) {
    return this.ctx.model.User.findById(id);
  }

  /**
   * 更新用户信息
   * @param {*} id 用户
   * @param {*} values 用户
   */
  async findByIdAndUpdate(id, values) {
    return this.ctx.model.User.findByIdAndUpdate(id, values);
  }
}

module.exports = UserService;

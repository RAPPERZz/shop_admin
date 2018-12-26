<template>
  <div class="role">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加角色按键 -->
    <el-button class="addButton" type="success" @click="showAddDialog" plain>增加角色</el-button>
    <!-- 渲染角色列表 -->
    <el-table :data="roleList" style="width: 100%">
      <!-- 显示分类 -->
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <span v-if="row.children.length===0">暂无权限</span>
          <!-- 一级权限 -->
          <el-row class="l1" v-for="l1 in row.children" :key="l1.id">
            <el-col :span="4">
              <el-tag @close="delRight(row,l1.id)" closable>{{l1.authName}}</el-tag>
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <el-col :span="20">
              <!-- 二级权限 -->
              <el-row class="l2" v-for="l2 in l1.children" :key="l2.id">
                <el-col :span="4">
                  <el-tag @close="delRight(row,l2.id)" closable type="success">{{l2.authName}}</el-tag>
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <el-col :span="20">
                  <span v-for="l3 in l2.children" :key="l3.id">
                    <el-tag
                      @close="delRight(row,l3.id)"
                      class="l3"
                      closable
                      type="warning"
                    >{{l3.authName}}</el-tag>
                  </span>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row}">
          <!-- 修改角色按钮 -->
          <el-button
            type="primary"
            @click="showEditDialog(row)"
            icon="el-icon-edit"
            plain
            size="mini"
          ></el-button>
          <!-- 删除角色按钮 -->
          <el-button type="danger" @click="delRole(row.id)" icon="el-icon-delete" plain size="mini"></el-button>
          <!-- 分配权限按钮 -->
          <el-button
            type="success"
            icon="el-icon-check"
            plain
            size="mini"
            @click="showAssignDialog(row)"
          >分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分配权限对话框 -->
    <el-dialog title="角色授权" :visible.sync="assignDialogVisible" width="40%">
      <!-- 树状图 -->
      <el-tree
        ref="tree"
        :data="data"
        :props="defaultProps"
        node-key="id"
        show-checkbox
        default-expand-all
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="assignDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignRight">分 配</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色<->修改角色 对话框 -->
    <el-dialog
      :title="this.addForm.id ? '修改角色': '添加角色'"
      :visible.sync="addDialogVisible"
      width="40%"
    >
      <el-form ref="addForm" :rules="rules" :model="addForm" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      data: [],
      assignDialogVisible: false,
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      roleId: '',
      addDialogVisible: false,
      addForm: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取角色列表数据
    async getRoleList() {
      let res = await this.axios('roles')
      let {
        meta: { status },
        data
      } = res
      if (status === 200) {
        this.roleList = data
      }
    },
    // 删除角色指定权限
    async delRight(role, rightId) {
      let res = await this.axios.delete(`roles/${role.id}/rights/${rightId}`)
      let {
        meta: { status },
        data
      } = res
      if (status === 200) {
        role.children = data
        this.$message.success('取消权限成功')
      } else {
        this.$message.info('取消权限失败')
      }
    },
    // 显示树状图分配权限
    async showAssignDialog(role) {
      this.roleId = role.id
      this.assignDialogVisible = true
      let res = await this.axios('rights/tree')
      let {
        meta: { status },
        data
      } = res
      if (status === 200) {
        this.data = data
      }

      let ids = []
      role.children.forEach(l1 => {
        l1.children.forEach(l2 => {
          l2.children.forEach(l3 => {
            ids.push(l3.id)
          })
        })
      })
      this.$refs.tree.setCheckedKeys(ids)
    },
    // 添加权限
    async assignRight() {
      let checkedKeys = this.$refs.tree.getCheckedKeys()
      let halfCheckedKeys = this.$refs.tree.getHalfCheckedNodes()
      let rids = checkedKeys.concat(halfCheckedKeys).join()
      let res = await this.axios.post(`roles/${this.roleId}/rights`, { rids })
      let {
        meta: { status }
      } = res
      if (status === 200) {
        this.getRoleList()
        this.assignDialogVisible = false
        this.$message.success('分配权限成功了')
      } else {
        this.$message.error('分配权限失败了')
      }
    },
    // 显示添加对话框
    showAddDialog() {
      this.addDialogVisible = true
      this.addForm.roleName = ''
      this.addForm.roleDesc = ''
      this.addForm.id = ''
    },
    // 添加角色<->修改角色
    saveRole() {
      this.$refs.addForm.validate(async valid => {
        if (!valid) return false

        let id = this.addForm.id
        let method = id ? 'put' : 'post'
        let url = id ? `roles/${id}` : `roles`
        let status = id ? 200 : 201

        let res = await this.axios({
          method,
          url,
          data: this.addForm
        })
        console.log(res)

        if (res.meta.status === status) {
          this.$refs.addForm.resetFields()
          this.addDialogVisible = false
          this.getRoleList()
          this.$message.success('操作成功')
        } else {
          this.$message.error('操作失败')
        }
      })
    },
    // 显示修改角色对话框
    showEditDialog(role) {
      console.log(role)
      this.addDialogVisible = true
      this.addForm.roleName = role.roleName
      this.addForm.roleDesc = role.roleDesc
      this.addForm.id = role.id
    },
    // 删除角色
    async delRole(id) {
      try {
        await this.$confirm('你确定要删除该角色吗?', '温馨提示', {
          type: 'warning'
        })
        let res = await this.axios.delete(`roles/${id}`)
        if (res.meta.status === 200) {
          this.getRoleList()
          this.$message.success('删除成功')
        }
      } catch (e) {
        this.$message.info('取消删除')
      }
    }
  },
  created() {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
.l1 {
  border-bottom: 1px dotted #ccc;
  padding: 10px 0;
}
.l2 {
  margin-bottom: 5px;
}
.l3 {
  margin-right: 5px;
  margin-bottom: 5px;
}
.addButton {
  margin: 5px;
}
</style>

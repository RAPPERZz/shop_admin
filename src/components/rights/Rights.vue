<template>
  <div class="rights">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 渲染表格 -->
    <el-table :data="rightsList" style="width: 100%">
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="authName" label="权限名称"></el-table-column>
      <el-table-column prop="path" label="路径"></el-table-column>
      <el-table-column prop="level" label="路径">
        <template slot-scope="scope">
          <span v-if="+scope.row.level === 0">一级</span>
          <span v-else-if="+scope.row.level === 1">二级</span>
          <span v-else>三级</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightsList: []
    }
  },
  methods: {
    async getRightList() {
      let res = await this.axios('rights/list')
      let {
        meta: { status },
        data
      } = res
      if (status === 200) {
        this.rightsList = data
      }
    }
  },
  created() {
    this.getRightList()
  }
}
</script>

<style>
</style>

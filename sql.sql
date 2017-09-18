username:root
password:111111
db.users.save({ username: 'root', password: '$2a$10$PiKIeoP6XWUM7J6LpeSPv.uqVcl8ZVw6MXQvrryC46VlQ9/9CnG/2', email: 'root@qguanzi.com', roleId: ObjectId("58ac2426a46c7dc66058e906"),createAt: new Date(), updateAt: new Date() });
db.roles.save( { rolename: "管理员", roleId : 0,updateAt:new Date(),createAt:new Date()} )
db.projectcategories.save( { name: "活动项目",updateAt:new Date(),createAt:new Date()} )
db.projectcategories.save( { name: "常规项目",updateAt:new Date(),createAt:new Date()} )
db.projectstatuses.save( { name: "已上线", className:'green',updateAt:new Date(),createAt:new Date()} )
db.projectstatuses.save( { name: "未上线", className:'red',updateAt:new Date(),createAt:new Date()} )
db.publishes.save( { publishName: "前端本地服务器",ip:'10.16.15.101',domain:'10.16.15.101',generate:true,dir:'/data/www/',updateAt:new Date(),createAt:new Date()} )
db.publishes.save( { publishName: "前端本地服务器2",ip:'10.16.15.101',domain:'10.16.15.101',generate:true,dir:'/data/www/',updateAt:new Date(),createAt:new Date()} )

http://10.16.15.101:3001/api/operateRole/create?operateName='删除图片'&route=image/del&roleIdArr[]=58d491f29b2c8f126575f0b4&roleIdArr[]=58ac2426a46c7dc66058e906
http://10.16.15.101:3001/api/operateRole/create?operateName='删除图片栏目'&route=imgCategory/del&roleIdArr[]=58d491f29b2c8f126575f0b4&roleIdArr[]=58ac2426a46c7dc66058e906
http://10.16.15.101:3001/api/operateRole/create?operateName='删除服务器配置'&route=publish/del&roleIdArr[]=58d491f29b2c8f126575f0b4&roleIdArr[]=58ac2426a46c7dc66058e906
http://10.16.15.101:3001/api/operateRole/create?operateName='删除项目栏目'&route=proCategory/del&roleIdArr[]=58d491f29b2c8f126575f0b4&roleIdArr[]=58ac2426a46c7dc66058e906

http://10.16.15.101:3001/api/operateRole/create?operateName='删除项目'&route=project/del&roleIdArr[]=58d491f29b2c8f126575f0b4&roleIdArr[]=58ac2426a46c7dc66058e906
http://10.16.15.101:3001/api/operateRole/create?operateName='项目下线'&route=project/offline&roleIdArr[]=58d491f29b2c8f126575f0b4&roleIdArr[]=58ac2426a46c7dc66058e906
http://10.16.15.101:3001/api/operateRole/create?operateName='项目回滚'&route=project/revert&roleIdArr[]=58d491f29b2c8f126575f0b4&roleIdArr[]=58ac2426a46c7dc66058e906

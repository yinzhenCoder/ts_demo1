 # TS代码生成工具
 目前只支持PostgreSQL生成interfaces文件
 ## 1.使用说明  
 - 修改配置文件
    在项目根目录下有一个generator.yaml文件,修改为要生成的数据库信息
 - 执行package.json中的 generate-interfaces 脚本




## 2.使用示例
### 2.1.生成interface
**示例表** 用户表： t_user

| 字段       | 类型           | 注释     | 是否非空 |
| ---------- | -------------- | -------- | -------- |
| id         | varchar（32）  | 主键ID   | 是       |
| name       | varchar（100） | 姓名     | 是       |
| phone      | int(11)        | 手机号   | 是       |
| contact_id | varchar (32)   | 联系人ID | 否       |


**生成interface**

```ts
/**
* 用户表
*/
export default interface TUser {
    /**
     * 主键id
     */
    id: string;
    /**
     * 姓名
     */
    name: string;
     /**
     * 手机号
     */
    phone: number;
     /**
     * 联系人ID
     */
    contactId?: string;
    }
```
## 3.资产文件
### 1.建表脚本
```sql
CREATE TABLE IF NOT EXISTS t_user (
                                      id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone INT NOT NULL,
    contact_id VARCHAR(32)
    );

COMMENT ON TABLE t_user IS '用户表';
COMMENT ON COLUMN t_user.id IS '主键ID';
COMMENT ON COLUMN t_user.name IS '姓名';
COMMENT ON COLUMN t_user.phone IS '手机号';
COMMENT ON COLUMN t_user.contact_id IS '联系人ID';

```
### 2.执行生成过程
#### 1.修改配置文件
![img.png](img.png)
#### 2.执行script generate-interfaces
![img_1.png](img_1.png)

![img_2.png](img_2.png)

![img_3.png](img_3.png)




### 3.生成文件

```ts


/**
 * 用户表
 */
export default interface TUser {


    /**
     * 主键ID
     */
    id: string;

    /**
     * 姓名
     */
    name: string;

    /**
     * 手机号
     */
    phone: number;

    /**
     * 联系人ID
     */
    contactId?: string;
}


```
# 扩展： TS代码生成器
目前只支持DAO、DAOImpl
### 1. 安装依赖

确保项目已经安装了相关依赖，包括但不限于以下内容：
- TypeScript
- PostgreSQL 驱动程序
- 相关的开发工具

### 2. 配置文件修改

在项目根目录下找到 `generator.yaml` 文件，根据需要修改其中的配置项，包括数据库连接信息和生成路径等。

示例配置文件内容：

```yaml
postgres:
  user: your_username
  host: your_host
  database: your_database
  password: your_password
  port: your_port

output:
  orgPath: code file path
  path: file output path

tables:
  - gl_tenant 
```

### 3. 生成接口


运行以下命令生成 DAO以及实现类：

```bash
npm run generate-interfaces
```

#### 3.3 生成其他接口

根据需要，可以扩展脚本来生成其他类型的接口，如服务层接口等。

### 4. 使用示例

#### 4.1 生成接口

以生成 DAO 接口为例，执行以上命令后，生成的接口文件将会保存在配置文件指定的输出路径下。

#### 4.2 使用生成的接口

在项目中引入生成的接口文件，即可在代码中使用生成的接口定义。


### 注意事项

- 在修改配置文件前，请备份原配置，以免出现错误配置导致的问题。
- 确保数据库连接信息的准确性和安全性，避免泄露敏感信息。
- 根据项目需求，适时更新生成的接口文件，以保持与数据库结构的一致性。

以上是使用 TS 代码生成器的简要说明，核心是修改配置文件后执行相应的脚本即可生成所需的接口文件。


### 参考项目：

  [schemats]:https://www.npmjs.com/package/@tgriesser/schemats


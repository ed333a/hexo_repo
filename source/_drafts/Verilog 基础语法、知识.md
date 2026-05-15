#### Verilog 常用关键字

| 关键字                  | 含义                                   |
| :------------------- | :----------------------------------- |
| module               | 模块开始定义，与 endmodule 作为一对关键字出现在代码头与代码尾 |
| endmodule            | 模块结束定义                               |
| input                | 定义一个输入端口                             |
| output               | 定义一个输出端口                             |
| parameter            | 信号参数定义，仅能定义一个确定的常量                   |
| wire                 |                                      |
| reg                  |                                      |
| always               |                                      |
| assign               |                                      |
| begin                |                                      |
| end                  |                                      |
| edge/posedge/negedge | 代表边沿触发信号，posedge 代表上升沿，negedge 代表下降沿 |
| case                 | case 语句起始标记，与 endcase 作为一对关键字组成代码片段  |
| endcase              | case 语句结束标记                          |
| default              | case 语句默认分支                          |
| if/else              | 判断语句，要配对避免 latch (锁存)的产生             |
| for                  | 循环语句                                 |
| and                  | 与门例化关键字，逻辑与                          |
| or                   | 或门例化关键字，逻辑或                          |
#### Verilog 基本设计单元

Verilog 的基本设计单元是”模块(block)“。一个模块由两部分组成，一部分描述**接口**，另一部分描述**逻辑功能**。

```verilog
module block(a,b,c,d);  // 定义模块的开始部分和端口 (a,b,c,d)
// 接口描述
	input  a,b;         // 定义端口 a,b 为输入端口
	output c,d;         // 定义端口 c,d 为输出端口
	
	
// 逻辑功能
assign c = a | b;       // 程序主体部分, 用 assign 关键字赋值
assign d = a & b;       // 程序主体部分, 用 assign 关键字赋值

endmodule               // 定义模块的结尾部分
```

每个 Verilog 程序包括四个主要部分

- 端口定义（a,b,c,d）
- IO 说明
	- input a,b;
	- output c,d;
- 内部信号声明
- 功能定义（assign 语句）

| <img src="./图片列表/模块接口表示图.png"/>  | <img src="./图片列表/模块功能表示图.png"/> |
| -------------------------------- | ------------------------------- |
| 模块接口表示图<br>a、b 为输入信号<br>c、d为输出信号 | 模块功能表示图                         |
|                                  |                                 |

模块可细分为以下两种
- 可综合模块：经由程序处理，最终可生成门级电路的模块
- 不可综合模块：不可生成门级电路的模块，该模块常用于仿真

功能定义有三种方法：

1. assign 语句：描述组合逻辑
2. always 语句：描述组合/时序逻辑
3. 例化实例元件：如 `and #2 u1(q,a,b)`

上面***三种逻辑功能并行运行***，但在always模块中，逻辑是顺序执行的

initial 和 always：

initial 语句在模块中只执行一次，常用于编写测试文件(test bench)，
用来产生仿真测试信号（激励信号），或者用于对寄存器变量赋初始值

always 语句一直在***重复不断***地活动，但是只有和***一定时间控制结***合在一起才有作用。

always 的时间控制可以是**边沿触发**，也可以是**电平触发**，可以是单个信号，也可以是多个信号，多个信号中间要用关键字 `or` 进行连接

```verilog 
always @(posedge sys_clk or negedge sys_rst_n) begin
	if (!sys_rst_n)
		counter <= 24'd0;
	else if(counter < 24'd1000_0000)
		counter <= counter + 1'b1;
	else 
		counter <= 24'd0;
end
```

上方代码中的 `always` 语句仅在 `sys_clk`上升沿或`sys_rst_n`的下降沿触发，其运行过程，要看语句内的触发条件是否满足。

由关键词 `or` 连接的多个事件名或信号名组成的列表称为“敏感列表”。

使用**边沿触发**的 `always` 语句常常描述的是**时序逻辑**行为
使用**电平触发**的 `always` 语句常常描述的是**组合逻辑**行为

```verilog
always @(a or b or c or d or e or f or q or h or p or m) begin
	out1 = a?(b+c):(d+e);
	out2 = f?(g+h):(p+m);
end

// 更简单的写法，@( * ) 表示对后面语句块中所有输入量的变化都是敏感的。

always @( * ) begin
	out1 = a?(b+c):(d+e);
	out2 = f?(g+h):(p+m);
end
```

根据逻辑功能的不同特点，可以将数字电路分为两大类：
- 组合逻辑电路：任意时刻的输出仅仅取决于该时刻的输入
- 时序逻辑电路：任意时刻的输出不仅取决于该时刻的输入，还取决于电路原先的状态

组合逻辑电路示意图：

![[img/uncategorized/组合逻辑图.png]]


时序逻辑电路示意图：
![[img/uncategorized/时序逻辑图.png]]



#### 赋值语句

Verilog HDL 语言中，信号有两种赋值方式
1. 阻塞赋值（blocking），如 `b=a`;
2. 非阻塞赋值（None_Blocking），如 `b<=a;`

阻塞赋值可以认为只有一个步骤的操作：
- 计算 RHS 并更新 LHS

非阻塞赋值可以认为两个步骤：
- 赋值开始，计算 RHS
- 赋值结束，更新 LHS

阻塞赋值语句总是在**前一个语句结束后**才开始赋值
非阻塞赋值在计算期间允许其它非阻塞的赋值语句同时计算 RHS 和更新 LHS，只能用在 `initial` 和 `always` 块中

在描述**组合逻辑**的 `always` 块中使用**阻塞赋值**，组合成逻辑电路结构。
在描述**时序逻辑**的 `always` 块中使用**非阻塞赋值**，组合成时序逻辑电路结构。

> 在同一个 `always` 块中**不能同时**使用**阻塞赋值**和**非阻塞赋值**
> 不允许在多个 `always` 块中对**同一个变量**进行赋值

#### case 语句
1. 分支表达式的值**互不相同**
2. 所有表达式的**位宽必须相等**，不能用  `'bx` 代替 `n'bx`
3. casez：比较时不考虑表达式中的高阻值
4. casex：比较是不考虑高阻值 z 和不定值 x

```verilog
case(num)
	4'h0:    seg_led <= 8'b1100_0000;
	4'h1:    seg_led <= 8'b1111_1001;
	default: seg_led <= 8'b1100_0000
endcase

casez(num)
	8'b1100_zzzz: 语句1; // 不考虑低八位的高阻值
	8'b1100_xxzz: 语句2; // 不考虑低 2 位的高阻值，但会考虑不定值
endcase

casex(num)
	8'b1100_zzzz: 语句1; // 不考虑低八位的高阻值
	8'b1100_xxxx: 语句2; // 不考虑低八位的不定值
	8'b1100_xxzz: 语句3; // 不考虑低八位的高阻值和不定值
endcase
```

### 缩位运算符

```verilog

reg [7:0] data;

// 缩位与：检查是否所有位都为1
if (&data)  // 等价于 if (data == 8'hFF)

// 缩位或：检查是否至少有一位为1
if (|data)  // 等价于 if (data != 8'h00)

// 缩位异或：检查奇偶性（1的个数是否为奇数）
if (^data)  // 1的个数为奇数时返回1

// 缩位同或：检查1的个数是否为偶数
if (~^data) // 1的个数为偶数时返回1

// 缩位与非：检查是否至少有一位为0
if (~&data) // 等价于 if (data != 8'hFF)

// 缩位或非：检查是否所有位都为0
if (~|data) // 等价于 if (data == 8'h00)

```












## 什么是虚拟机？

虚拟机（Virtual Machine）指通过软件模拟的具有完整硬件[系统功能](https://baike.baidu.com/item/%E7%B3%BB%E7%BB%9F%E5%8A%9F%E8%83%BD/10394740?fromModule=lemma_inlink)的、运行在一个完全隔离环境中的完整[计算机系统](https://baike.baidu.com/item/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%B3%BB%E7%BB%9F/7210959?fromModule=lemma_inlink)。在实体计算机中能够完成的工作在虚拟机中都能够实现。在计算机中创建虚拟机时，需要将实体机的部分硬盘和[内存容量](https://baike.baidu.com/item/%E5%86%85%E5%AD%98%E5%AE%B9%E9%87%8F/3361934?fromModule=lemma_inlink)作为虚拟机的硬盘和内存容量。每个虚拟机都有独立的[CMOS](https://baike.baidu.com/item/CMOS/428167?fromModule=lemma_inlink)、硬盘和[操作系统](https://baike.baidu.com/item/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/192?fromModule=lemma_inlink)，可以像使用实体机一样对虚拟机进行操作。 

虚拟机技术是虚拟化技术的一种，所谓虚拟化技术就是将事物从一种形式转变成另一种形式，最常用的虚拟化技术有[操作系统](https://baike.baidu.com/item/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/192?fromModule=lemma_inlink)中内存的虚拟化，实际[运行时](https://baike.baidu.com/item/%E8%BF%90%E8%A1%8C%E6%97%B6/3335184?fromModule=lemma_inlink)用户需要的[内存空间](https://baike.baidu.com/item/%E5%86%85%E5%AD%98%E7%A9%BA%E9%97%B4/22010756?fromModule=lemma_inlink)可能远远大于物理机器的内存大小，利用内存的虚拟化技术，用户可以将一部分硬盘虚拟化为内存，而这对用户是透明的。又如，可以利用[虚拟专用网](https://baike.baidu.com/item/%E8%99%9A%E6%8B%9F%E4%B8%93%E7%94%A8%E7%BD%91/320318?fromModule=lemma_inlink)技术（[VPN](https://baike.baidu.com/item/VPN/382304?fromModule=lemma_inlink)）在公共网络中虚拟化一条安全，稳定的“隧道”，用户感觉像是使用私有网络一样。


## 虚拟机分类

### linux虚拟机

一种安装在Windows上的虚拟linux操作环境，就被称为[linux](https://baike.baidu.com/item/linux/0?fromModule=lemma_inlink)虚拟机。它实际上只是个文件而已，是虚拟的[linux](https://baike.baidu.com/item/linux/0?fromModule=lemma_inlink)环境，而非真正意义上的[操作系统](https://baike.baidu.com/item/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/192?fromModule=lemma_inlink)。但是它们的实际效果是一样的。所以安装在虚拟机上使用好。

windowsXP虚拟机[vmware](https://baike.baidu.com/item/vmware/0?fromModule=lemma_inlink)下安装[Linux](https://baike.baidu.com/item/Linux/27050?fromModule=lemma_inlink) 我们在实际的Windows　XP中(宿主计算机)再虚拟出一台电脑(虚拟机)，并在上面安装Linux系统，这样，你就可以放心大胆地进行各种Linux练习而无须担心操作不当导致宿主机[系统崩溃](https://baike.baidu.com/item/%E7%B3%BB%E7%BB%9F%E5%B4%A9%E6%BA%83/71286?fromModule=lemma_inlink)了。并且你可以举一反三，将一台电脑变成三台、四台，再分别安装上其他的系统。(运行[虚拟机软件](https://baike.baidu.com/item/%E8%99%9A%E6%8B%9F%E6%9C%BA%E8%BD%AF%E4%BB%B6/9003764?fromModule=lemma_inlink)的[操作系统](https://baike.baidu.com/item/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/192?fromModule=lemma_inlink)叫Host OS，在虚拟机里运行的操作系统叫Guest OS)。

### Java虚拟机

Java虚拟机（[JVM](https://baike.baidu.com/item/JVM/2902369?fromModule=lemma_inlink)）是Java Virtual Machine的缩写，它是一个虚构出来的计算机，是通过在实际的计算机上[仿真模拟](https://baike.baidu.com/item/%E4%BB%BF%E7%9C%9F%E6%A8%A1%E6%8B%9F/407213?fromModule=lemma_inlink)各种计算机[功能模拟](https://baike.baidu.com/item/%E5%8A%9F%E8%83%BD%E6%A8%A1%E6%8B%9F/2055668?fromModule=lemma_inlink)来实现的。Java虚拟机有自己完善的硬件架构，如处理器、[堆栈](https://baike.baidu.com/item/%E5%A0%86%E6%A0%88/1682032?fromModule=lemma_inlink)、[寄存器](https://baike.baidu.com/item/%E5%AF%84%E5%AD%98%E5%99%A8/187682?fromModule=lemma_inlink)等，还具有相应的[指令系统](https://baike.baidu.com/item/%E6%8C%87%E4%BB%A4%E7%B3%BB%E7%BB%9F/3220297?fromModule=lemma_inlink)。

## 主要用处

1.演示环境，可以安装各种演示环境，便于做各种例子

2.保证主机的快速运行，减少不必要的垃圾[安装程序](https://baike.baidu.com/item/%E5%AE%89%E8%A3%85%E7%A8%8B%E5%BA%8F/3765365?fromModule=lemma_inlink)，偶尔使用的程序，或者测试用的程序在虚拟机上运行

3.避免每次重新安装，银行等常用工具，不经常使用，而且要求保密比较好的，单独在一个环境下面运行 

4.想测试一下不熟悉的应用，在虚拟机中随便安装和彻底删除

5.体验不同版本的[操作系统](https://baike.baidu.com/item/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/192?fromModule=lemma_inlink)，如[Linux](https://baike.baidu.com/item/Linux/27050?fromModule=lemma_inlink)、Mac等。

终端虚拟化由于其带来的[维护费用](https://baike.baidu.com/item/%E7%BB%B4%E6%8A%A4%E8%B4%B9%E7%94%A8/22679717?fromModule=lemma_inlink)的大幅降低而受到追捧——如能降低[占用空间](https://baike.baidu.com/item/%E5%8D%A0%E7%94%A8%E7%A9%BA%E9%97%B4/5891606?fromModule=lemma_inlink)，降低购买软硬件设备的成本，节省能源和更低的维护成本。它比实际存在的[终端设备](https://baike.baidu.com/item/%E7%BB%88%E7%AB%AF%E8%AE%BE%E5%A4%87/643738?fromModule=lemma_inlink)更加具备性价比优势。但这些并非是教育行业和厂商对[虚拟化技术](https://baike.baidu.com/item/%E8%99%9A%E6%8B%9F%E5%8C%96%E6%8A%80%E6%9C%AF/276750?fromModule=lemma_inlink)情有独钟的惟一原因。另一方面，一般较少提及，[虚拟化技术](https://baike.baidu.com/item/%E8%99%9A%E6%8B%9F%E5%8C%96%E6%8A%80%E6%9C%AF/276750?fromModule=lemma_inlink)能大幅提升系统的安全性。


## 常用软件

### VMware Workstation

[VMware](https://baike.baidu.com/item/VMware/5461553?fromModule=lemma_inlink)是EMC公司旗下独立的软件公司，1998年1月，[Stanford](https://baike.baidu.com/item/Stanford/8480101?fromModule=lemma_inlink)大学的Mendel Rosenblum教授带领他的学生Edouard Bugnion和Scott Devine及对虚拟机技术多年的研究成果创立了[VMware公司](https://baike.baidu.com/item/VMware%E5%85%AC%E5%8F%B8/9546650?fromModule=lemma_inlink)，主要研究在工业领域应用的大型主机级的[虚拟技术](https://baike.baidu.com/item/%E8%99%9A%E6%8B%9F%E6%8A%80%E6%9C%AF/4968684?fromModule=lemma_inlink)计算机，并于1999年发布了它的第一款产品:基于主机模型的虚拟机[VMware Workstation](https://baike.baidu.com/item/VMware%20Workstation/9884359?fromModule=lemma_inlink)。尔后于2001年推出了面向服务器市场的VMware GSX Server和[VMware ESX](https://baike.baidu.com/item/VMware%20ESX/795548?fromModule=lemma_inlink) Server。今天[VMware](https://baike.baidu.com/item/VMware/5461553?fromModule=lemma_inlink)是虚拟机市场上的领航者，其首先提出并采用的气球[驱动程序](https://baike.baidu.com/item/%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F/103009?fromModule=lemma_inlink)(balloon [driver](https://baike.baidu.com/item/driver/4875907?fromModule=lemma_inlink))，影子[页表](https://baike.baidu.com/item/%E9%A1%B5%E8%A1%A8/679625?fromModule=lemma_inlink)(shadow page table)，虚拟设备驱动程序(Virtual Driver)等[均已](https://baike.baidu.com/item/%E5%9D%87%E5%B7%B2/6068131?fromModule=lemma_inlink)被后来的其它虚拟机如[Xen](https://baike.baidu.com/item/Xen/11050512?fromModule=lemma_inlink)采用。

使用[Vmware](https://baike.baidu.com/item/Vmware/5461553?fromModule=lemma_inlink)，可以同时运行[Linux](https://baike.baidu.com/item/Linux/27050?fromModule=lemma_inlink)各种发行版、Dos、Windows各种版本，Unix等，甚至可以在同一台计算机上安装多个Linux发行版、 多个[Windows](https://baike.baidu.com/item/Windows/165458?fromModule=lemma_inlink)版本。


### Parallels Desktop

[Parallels Desktop](https://baike.baidu.com/item/Parallels%20Desktop/3600099?fromModule=lemma_inlink)是适用于[Mac OS](https://baike.baidu.com/item/Mac%20OS/2840867?fromModule=lemma_inlink)平台上的虚拟机解决方案。无需重启即可在同时一台Mac电脑上随时访问Windows和Mac两个系统上的众多应用程序。与VMware最大的区别在于Parallels Desktop无需重启，两个系 统同时运行。两系统间可以实现文件互传，素材共用。

### Virtual PC

 [Virtual PC](https://baike.baidu.com/item/Virtual%20PC/10646925?fromModule=lemma_inlink)是[微软](https://baike.baidu.com/item/%E5%BE%AE%E8%BD%AF/124767?fromModule=lemma_inlink)公司(Microsoft)收购过来的，最早不是微软开发的。Virtual PC可以允许你在一个工作站上同时运行多个PC操作系统，当你转向一个新OS时，可以为你运行传统应用提供一个安全的环境以保持[兼容性](https://baike.baidu.com/item/%E5%85%BC%E5%AE%B9%E6%80%A7/1446869?fromModule=lemma_inlink)，它可以保存重新配置的时间，使得你的支持，开发，培训工作可以更加有效。


### Oracle VM VirtualBox

 Oracle VM [VirtualBox](https://baike.baidu.com/item/VirtualBox/5842786?fromModule=lemma_inlink)是由[Sun Microsystems](https://baike.baidu.com/item/Sun%20Microsystems/6064586?fromModule=lemma_inlink)公司出品的软件([Sun Microsystems](https://baike.baidu.com/item/Sun%20Microsystems/6064586?fromModule=lemma_inlink)于2010年被Oracle收购)，原由德国innotek公司开发。2008年2月12日，Sun Microsystems宣布将以购买股票的方式收购德国Innotek软件公司，新版不再叫做Innotek VirtualBox，而改叫Sun xVM VirtualBox。2010年1月21日，欧盟终于同意Oracle收购Sun，VirtualBox再次改名变成Oracle VM VirtualBox。[VirtualBox](https://baike.baidu.com/item/VirtualBox/5842786?fromModule=lemma_inlink)是[开源软件](https://baike.baidu.com/item/%E5%BC%80%E6%BA%90%E8%BD%AF%E4%BB%B6/8105369?fromModule=lemma_inlink)。

### VMLite

[VMLite](https://baike.baidu.com/item/VMLite/5112141?fromModule=lemma_inlink)是全球首款中国人自己设计的高速虚拟机，[VMLite](https://baike.baidu.com/item/VMLite/5112141?fromModule=lemma_inlink)发布的短短几周内已经吸引了全球上万名虚拟机玩家注册下载并使 用VMLite软件。

[VMLite](https://baike.baidu.com/item/VMLite/5112141?fromModule=lemma_inlink)是一个虚拟机软件，其附带的VMLite XP模式与微软推出的[Windows XP](https://baike.baidu.com/item/Windows%20XP/191927?fromModule=lemma_inlink)模式几乎一模一样，但是却不要求你的CPU非得支持虚拟化才能运行。VMLite允许你直接使用从微软网站上下载下来的Windows XP模式安装文件，来建立Windows XP虚 拟机。[VMLite](https://baike.baidu.com/item/VMLite/5112141?fromModule=lemma_inlink) XP模式配置完成后，在Windows 7的开始菜单中也会出现虚拟机中安装的软件的[快捷方式](https://baike.baidu.com/item/%E5%BF%AB%E6%8D%B7%E6%96%B9%E5%BC%8F/1434992?fromModule=lemma_inlink);在虚拟机中运行的程 序，可以无缝的在[Windows 7](https://baike.baidu.com/item/Windows%207/1083761?fromModule=lemma_inlink)桌面上显示，看起来就跟在本机中运行一样。 

 VMLite已经包括VMLite [XP Mode](https://baike.baidu.com/item/XP%20Mode/935003?fromModule=lemma_inlink)、VMLite [Workstation](https://baike.baidu.com/item/Workstation/7233948?fromModule=lemma_inlink)、MyOldPCs、VMLite VirtualApps Studio、VMLite VirtualApps Player、VBoot六大产品，非常全面。

---
![[Pasted image 20241105002114.png]]
## Linux

Linux，一般指GNU/Linux（单独的Linux内核并不可直接使用，一般搭配GNU套件，故得此称呼），是一种免费使用和自由传播的[类UNIX](https://baike.baidu.com/item/%E7%B1%BBUNIX/9032872?fromModule=lemma_inlink)操作系统，其内核由[林纳斯·本纳第克特·托瓦兹](https://baike.baidu.com/item/%E6%9E%97%E7%BA%B3%E6%96%AF%C2%B7%E6%9C%AC%E7%BA%B3%E7%AC%AC%E5%85%8B%E7%89%B9%C2%B7%E6%89%98%E7%93%A6%E5%85%B9/1034429?fromModule=lemma_inlink)（Linus Benedict Torvalds）于1991年10月5日首次发布，它主要受到[Minix](https://baike.baidu.com/item/Minix/7106045?fromModule=lemma_inlink)和[Unix](https://baike.baidu.com/item/Unix/219943?fromModule=lemma_inlink)思想的启发，是一个基于[POSIX](https://baike.baidu.com/item/POSIX/3792413?fromModule=lemma_inlink)的多用户、[多任务](https://baike.baidu.com/item/%E5%A4%9A%E4%BB%BB%E5%8A%A1/1011764?fromModule=lemma_inlink)、支持[多线程](https://baike.baidu.com/item/%E5%A4%9A%E7%BA%BF%E7%A8%8B/1190404?fromModule=lemma_inlink)和多[CPU](https://baike.baidu.com/item/CPU/120556?fromModule=lemma_inlink)的[操作系统](https://baike.baidu.com/item/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/192?fromModule=lemma_inlink)。它支持[32位](https://baike.baidu.com/item/32%E4%BD%8D/5812218?fromModule=lemma_inlink)和[64位](https://baike.baidu.com/item/64%E4%BD%8D/2262282?fromModule=lemma_inlink)硬件，能运行主要的[Unix](https://baike.baidu.com/item/Unix/219943?fromModule=lemma_inlink)工具软件、应用程序和网络协议。

Linux继承了Unix以网络为核心的设计思想，是一个性能稳定的多用户网络操作系统。Linux有上百种不同的发行版，如基于社区开发的[Debian](https://baike.baidu.com/item/Debian/748667?fromModule=lemma_inlink)、[Arch Linux](https://baike.baidu.com/item/Arch%20Linux/8876099?fromModule=lemma_inlink)，和基于商业开发的[Red Hat Enterprise Linux](https://baike.baidu.com/item/Red%20Hat%20Enterprise%20Linux/10770503?fromModule=lemma_inlink)、[SUSE](https://baike.baidu.com/item/SUSE/60409?fromModule=lemma_inlink)、[Oracle Linux](https://baike.baidu.com/item/Oracle%20Linux/6876458?fromModule=lemma_inlink)等。


## 系统简介


Linux，Linux Is Not UniX 的[递归缩写](https://baike.baidu.com/item/%E9%80%92%E5%BD%92%E7%BC%A9%E5%86%99/2216444?fromModule=lemma_inlink)，一般指GNU/Linux，是一套免费使用和自由传播的类Unix操作系统，是一个遵循POSIX的多用户、多任务、支持多线程和多[CPU](https://baike.baidu.com/item/CPU/120556?fromModule=lemma_inlink)的操作系统。

伴随着[互联网](https://baike.baidu.com/item/%E4%BA%92%E8%81%94%E7%BD%91/199186?fromModule=lemma_inlink)的发展，Linux得到了来自全世界软件爱好者、组织、公司的支持。它除了在[服务器](https://baike.baidu.com/item/%E6%9C%8D%E5%8A%A1%E5%99%A8/100571?fromModule=lemma_inlink)方面保持着强劲的发展势头以外，在个人电脑、[嵌入式](https://baike.baidu.com/item/%E5%B5%8C%E5%85%A5%E5%BC%8F/575465?fromModule=lemma_inlink)系统上都有着长足的进步。使用者不仅可以直观地获取该操作系统的实现机制，而且可以根据自身的需要来修改完善Linux，使其最大化地适应用户的需要。 

Linux不仅系统性能稳定，而且是[开源软件](https://baike.baidu.com/item/%E5%BC%80%E6%BA%90%E8%BD%AF%E4%BB%B6/8105369?fromModule=lemma_inlink)。其核心[防火墙](https://baike.baidu.com/item/%E9%98%B2%E7%81%AB%E5%A2%99/52767?fromModule=lemma_inlink)组件性能高效、配置简单，保证了系统的安全。在很多企业网络中，为了追求速度和安全，Linux不仅仅是被网络运维人员当作服务器使用，甚至当作网络防火墙，这是Linux的一大亮点。

Linux具有[开放源码](https://baike.baidu.com/item/%E5%BC%80%E6%94%BE%E6%BA%90%E7%A0%81/7176422?fromModule=lemma_inlink)、没有版权、技术社区用户多等特点，开放源码使得用户可以自由裁剪，灵活性高，功能强大，成本低。尤其系统中内嵌网络协议栈，经过适当的配置就可实现[路由器](https://baike.baidu.com/item/%E8%B7%AF%E7%94%B1%E5%99%A8/108294?fromModule=lemma_inlink)的功能。这些特点使得Linux成为开发路由交换设备的理想开发平台。



## 发展历程

Linux操作系统的诞生、发展和成长过程始终依赖着五个重要支柱：[Unix操作系统](https://baike.baidu.com/item/Unix%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/851445?fromModule=lemma_inlink)、[MINIX](https://baike.baidu.com/item/MINIX/7106045?fromModule=lemma_inlink)操作系统、[GNU](https://baike.baidu.com/item/GNU/671972?fromModule=lemma_inlink)计划、[POSIX](https://baike.baidu.com/item/POSIX/3792413?fromModule=lemma_inlink)标准和Internet网络。

20世纪80年代，[计算机硬件](https://baike.baidu.com/item/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A1%AC%E4%BB%B6/5459592?fromModule=lemma_inlink)的性能不断提高，PC的市场不断扩大，当时可供计算机选用的操作系统主要有Unix、[DOS](https://baike.baidu.com/item/DOS/32025?fromModule=lemma_inlink)和MacOS这几种。[Unix](https://baike.baidu.com/item/Unix/219943?fromModule=lemma_inlink)价格昂贵，不能运行于[PC](https://baike.baidu.com/item/PC/107?fromModule=lemma_inlink)；[DOS](https://baike.baidu.com/item/DOS/32025?fromModule=lemma_inlink)显得简陋，且[源代码](https://baike.baidu.com/item/%E6%BA%90%E4%BB%A3%E7%A0%81/3814213?fromModule=lemma_inlink)被软件厂商严格保密；[MacOS](https://baike.baidu.com/item/MacOS/8654551?fromModule=lemma_inlink)是一种专门用于苹果计算机的操作系统。

此时，计算机科学领域迫切需要一个更加完善、强大、廉价和完全开放的操作系统。由于供教学使用的典型操作系统很少，因此当时在[荷兰](https://baike.baidu.com/item/%E8%8D%B7%E5%85%B0/190469?fromModule=lemma_inlink)当教授的美国人AndrewS.Tanenbaum编写了一个[操作系统](https://baike.baidu.com/item/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/192?fromModule=lemma_inlink)，名为[MINIX](https://baike.baidu.com/item/MINIX/7106045?fromModule=lemma_inlink)，为了向学生讲述操作系统内部工作原理。

MINIX虽然很好，但只是一个用于教学目的的简单操作系统，而不是一个强有力的实用操作系统，然而最大的好处就是公开源代码。全世界学计算机的学生都通过钻研MINIX源代码来了解电脑里运行的MINIX操作系统，[芬兰赫尔辛基大学](https://baike.baidu.com/item/%E8%8A%AC%E5%85%B0%E8%B5%AB%E5%B0%94%E8%BE%9B%E5%9F%BA%E5%A4%A7%E5%AD%A6/3096544?fromModule=lemma_inlink)大学二年级的学生Linus Torvalds就是其中一个。在吸收了MINIX精华的基础上，Linus于1991年写出了属于自己的Linux操作系统，版本为Linux0.01，是Linux时代开始的标志。他利用Unix的核心，去除繁杂的核心程序，改写成适用于一般计算机的x86系统，并放在网络上供大家下载，1994年推出完整的核心Version1.0。至此，Linux逐渐成为功能完善、稳定的操作系统，并被广泛使用。


---
## 主要特性

### 基本思想

Linux的基本思想有两点：第一，一切都是文件；第二，每个文件都有确定的用途。其中第一条详细来讲就是系统中的所有都归结为一个文件，包括[命令](https://baike.baidu.com/item/%E5%91%BD%E4%BB%A4/8135974?fromModule=lemma_inlink)、[硬件](https://baike.baidu.com/item/%E7%A1%AC%E4%BB%B6/479446?fromModule=lemma_inlink)和[软件](https://baike.baidu.com/item/%E8%BD%AF%E4%BB%B6/12053?fromModule=lemma_inlink)设备、[操作系统](https://baike.baidu.com/item/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/192?fromModule=lemma_inlink)、[进程](https://baike.baidu.com/item/%E8%BF%9B%E7%A8%8B/382503?fromModule=lemma_inlink)等等对于操作系统[内核](https://baike.baidu.com/item/%E5%86%85%E6%A0%B8/108410?fromModule=lemma_inlink)而言，都被视为拥有各自特性或类型的文件。至于说Linux是基于Unix的，很大程度上也是因为这两者的基本思想十分相近。

### 完全免费

Linux是一款免费(或自由，即free)的操作系统，用户可以通过网络或其他途径免费获得，并可以任意修改其[源代码](https://baike.baidu.com/item/%E6%BA%90%E4%BB%A3%E7%A0%81/3969?fromModule=lemma_inlink)。这是其他的操作系统所做不到的。正是由于这一点，来自全世界的无数[程序员](https://baike.baidu.com/item/%E7%A8%8B%E5%BA%8F%E5%91%98/62748?fromModule=lemma_inlink)参与了Linux的修改、编写工作，[程序员](https://baike.baidu.com/item/%E7%A8%8B%E5%BA%8F%E5%91%98/62748?fromModule=lemma_inlink)可以根据自己的兴趣和灵感对其进行改变，这让Linux吸收了无数程序员的精华，不断壮大。

### 兼容POSIX

这使得可以在Linux下通过相应的[模拟器](https://baike.baidu.com/item/%E6%A8%A1%E6%8B%9F%E5%99%A8/761807?fromModule=lemma_inlink)运行常见的[DOS](https://baike.baidu.com/item/DOS/32025?fromModule=lemma_inlink)、Windows的程序。这为用户从Windows转到Linux奠定了基础。许多用户在考虑使用Linux时，就想到以前在Windows下常见的程序是否能正常运行，这一点就消除了他们的疑虑。

### 多用户、多任务

Linux支持多用户，各个用户对于自己的文件设备有自己特殊的权利，保证了各用户之间互不影响。[多任务](https://baike.baidu.com/item/%E5%A4%9A%E4%BB%BB%E5%8A%A1/1011764?fromModule=lemma_inlink)则是现代电脑最主要的一个特点，Linux可以使多个程序同时并独立地运行。

### 良好的界面

Linux同时具有字符界面和[图形界面](https://baike.baidu.com/item/%E5%9B%BE%E5%BD%A2%E7%95%8C%E9%9D%A2/8146283?fromModule=lemma_inlink)。在字符界面用户可以通过键盘输入相应的[指令](https://baike.baidu.com/item/%E6%8C%87%E4%BB%A4/3225201?fromModule=lemma_inlink)来进行操作。它同时也提供了类似Windows图形界面的X-Window系统，用户可以使用鼠标对其进行操作。在X-Window环境中就和在Windows中相似，可以说是一个Linux版的Windows。

### 支持多种平台

Linux可以运行在多种[硬件平台](https://baike.baidu.com/item/%E7%A1%AC%E4%BB%B6%E5%B9%B3%E5%8F%B0/63147502?fromModule=lemma_inlink)上，如具有[x86](https://baike.baidu.com/item/x86/6150538?fromModule=lemma_inlink)、680x0、SPARC、Alpha等处理器的平台。此外Linux还是一种嵌入式操作系统，可以运行在掌上电脑、机顶盒或游戏机上。2001年1月份发布的Linux 2.4版内核已经能够完全支持[Intel](https://baike.baidu.com/item/Intel/125450?fromModule=lemma_inlink)64位芯片架构。同时Linux也支持多处理器技术。多个处理器同时工作，使系统性能大大提高。

---
## 开发工具


Linux已经成为工作、娱乐和个人生活等多个领域的支柱，人们已经越来越离不开它。在Linux的帮助下，技术的变革速度超出了人们的想象，Linux开发的速度也以指数规模增长。因此，越来越多的开发者也不断地加入开源和学习Linux开发的潮流当中。在这个过程之中，合适的工具是必不可少的，可喜的是，随着Linux的发展，大量适用于Linux的开发工具也不断成熟。 [5]

### 容器

放眼现实，如今已经是容器的时代了。容器既极其容易部署，又可以方便地构建开发环境。如果针对的是特定的平台的开发，将开发流程所需要的各种工具都创建到容器映像中是一种很好的方法，只要使用这一个容器映像，就能够快速启动大量运行所需服务的实例。 [5]

#### 版本控制工具

如果正在开发一个大型项目，又或者参与团队开发，版本控制工具是必不可少的，它可以用于记录[代码](https://baike.baidu.com/item/%E4%BB%A3%E7%A0%81/86048?fromModule=lemma_inlink)变更、提交代码以及合并代码。如果没有这样的工具，项目几乎无法妥善管理。 [5]

#### 文本编辑器

如果没有[文本编辑器](https://baike.baidu.com/item/%E6%96%87%E6%9C%AC%E7%BC%96%E8%BE%91%E5%99%A8/8853160?fromModule=lemma_inlink)，在Linux上开发将会变得异常艰难。当然，[文本编辑器](https://baike.baidu.com/item/%E6%96%87%E6%9C%AC%E7%BC%96%E8%BE%91%E5%99%A8/8853160?fromModule=lemma_inlink)之间孰优孰劣，具体还是要取决于开发者的需求。 [5]

#### 集成开发环境

集成开发环境（Integrated Development Environment，[IDE](https://baike.baidu.com/item/IDE/8232086?fromModule=lemma_inlink)） 是包含一整套全面的工具、可以实现一站式功能的开发环境。 [5]

#### 文本比较工具

有时候会需要比较两个文件的内容来找到它们之间的不同之处，它们可能是同一文件的两个不同副本（例如有一个经过编译，而另一个没有）。这种情况下，肯定不想要凭借肉眼来找出差异，而是想要使用像[Med](https://baike.baidu.com/item/Med/8237994?fromModule=lemma_inlink)这样的工具。

---
## 嵌入式

对Linux进行适当的修改和删减，并且能够在[嵌入式](https://baike.baidu.com/item/%E5%B5%8C%E5%85%A5%E5%BC%8F/575465?fromModule=lemma_inlink)系统上使用的系统，就是嵌入式Linux操作系统。具有如下的特点：

Linux系统是完全开放、免费的。正是开放性，它才能和其他系统互相兼容，进而实现信息的互联。而且它可以任意修改源代码，这是其他系统所不具备的。

[Linux操作系统](https://baike.baidu.com/item/Linux%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/850887?fromModule=lemma_inlink)的显著优势是多用户和多任务。保证了多个用户使用互不影响；多任务独立开后，互不干扰，使得效率方面大大提高，可以充分把性能发挥出来。

设备是独立的。只要安装驱动程序，在[驱动程序](https://baike.baidu.com/item/%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F/103009?fromModule=lemma_inlink)的支持和帮助下，任何用户都可以像使用文件一样，对任意设备进行使用和操作，这使得人们完全不用考虑设备存在的具体形式。

## 服务器

[Linux服务器](https://baike.baidu.com/item/Linux%E6%9C%8D%E5%8A%A1%E5%99%A8/7296589?fromModule=lemma_inlink)是设计出来进行业务处理应用的，在网络和计算机系统当中有广泛的应用，可以提供数据库管理和网络服务等内容，是一种性能非常高的和开源的[服务器](https://baike.baidu.com/item/%E6%9C%8D%E5%8A%A1%E5%99%A8/100571?fromModule=lemma_inlink)，在中国的[计算机系统](https://baike.baidu.com/item/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%B3%BB%E7%BB%9F/7210959?fromModule=lemma_inlink)的[客户端](https://baike.baidu.com/item/%E5%AE%A2%E6%88%B7%E7%AB%AF/101081?fromModule=lemma_inlink)当中，有很多采用的就是Linux系统，其使用的范围非常广泛，用户体验反应较好。但是对于一些希望计算机应用性能比较高的单位而言，[windows](https://baike.baidu.com/item/windows/165458?fromModule=lemma_inlink)系统需要经常进行资源整合和碎片化管理，系统在配置的时候经常需要重新启动，这就无法避免产生停机的问题。同时，由于Linux系统的处理能力非常强悍，具备不可比拟的[稳定性](https://baike.baidu.com/item/%E7%A8%B3%E5%AE%9A%E6%80%A7/4557421?fromModule=lemma_inlink)特征，因而Linux系统就不用经常进行重启，Linux系统的变化可以在配置的过程中实现，所以Linux服务器出现故障的概率比较小，所以很多企业组织在计算机配置的过程中经常使用Linux系统，从而降低[服务器](https://baike.baidu.com/item/%E6%9C%8D%E5%8A%A1%E5%99%A8/100571?fromModule=lemma_inlink)发生崩溃的可能性，很多企业在配置Linux系统的时候，都是通过减少服务器的故障发生率，实现企业业务的高效运转。

### 安全加固

用户账户以及登录安全

删除多余用户和用户组。Linux是多用户操作系统，存在很多种不一样的角色系统账号，当安装完成操作系统之后，系统会默认为未添加许用户组及用户，若是部分用户或是用户组不需要，应当立即删除它们，否则黑客很有可能利用这些账号，对服务器实施攻击。具体保留哪些账号，可以依据服务器的用途来决定。

关闭不需要的[系统服务](https://baike.baidu.com/item/%E7%B3%BB%E7%BB%9F%E6%9C%8D%E5%8A%A1/11027121?fromModule=lemma_inlink)。操作系统安装完成之后，其会在安装的过程当中，会自主的启动各种类型的服务程序内容，对于长时间运行的服务器而言，其运行的[服务程序](https://baike.baidu.com/item/%E6%9C%8D%E5%8A%A1%E7%A8%8B%E5%BA%8F/16915606?fromModule=lemma_inlink)越多，则系统的安全性就越低。所以，用户或是用户组就需要将一些应用不到的服务程序进行关闭，这对提升系统的安全性能，有着极大的帮助。

密码安全策略。在Linux之下，远程的登录系统具备两种认证的形式：即[密钥](https://baike.baidu.com/item/%E5%AF%86%E9%92%A5/101144?fromModule=lemma_inlink)与密码认证。其中，密钥认证的形式，主要是将[公钥](https://baike.baidu.com/item/%E5%85%AC%E9%92%A5/6447788?fromModule=lemma_inlink)储存在远程的服务器之上，[私钥](https://baike.baidu.com/item/%E7%A7%81%E9%92%A5/8973452?fromModule=lemma_inlink)存储在本地。当进行系统登录的时候，再通过本地的私钥，以及远程的服务器公钥，进行配对认证的操作，若是认证的匹配度一致，则用户便能够畅通无阻的登录系统。此类认证的方式，并不会受到暴力破解的威胁。与此同时，只需要确保本地私钥的安全，使其不会被黑客所盗取即可，攻击者便不能够通过此类认证方式登录到系统中。所以，推荐使用密钥方式进行系统登录。

有效应用su、[sudo](https://baike.baidu.com/item/sudo/7337623?fromModule=lemma_inlink)命令。su命令的作用的是对用户进行切换。当管理员登录到系统之后，使用su命令切换到超级用户角色来执行一些需要超级权限的命令。但是由于超级用户的权限过大，同时，需要管理人员知道[超级用户](https://baike.baidu.com/item/%E8%B6%85%E7%BA%A7%E7%94%A8%E6%88%B7/4171908?fromModule=lemma_inlink)密码，因此su命令具有很严重的管理风险。

sudo命令允许系统赋予普通用户一些超级权限，并且不需普通用户切换到超级用户。因此，在管理上应当细化权限分配机制，使用sudo命令为每一位管理员服务其特定的管理权限。

### 安全认证

远程登录应用[SSH](https://baike.baidu.com/item/SSH/10407?fromModule=lemma_inlink)登录方式。telnet是一类存在安全隐患的登录认证服务，其在网络之上利用明文传输内容，黑客很容易通过截获telnet数据包，获得用户的登录口令。并且telnet服务程序的安全验证方式存在较大的安全隐患，使其成为黑客攻击的目标。SSH服务则会将数据进行加密传输，能够防止[DNS](https://baike.baidu.com/item/DNS/427444?fromModule=lemma_inlink)欺骗以及IP欺骗，并且传输的数据是经过压缩，在一定程度上保证了服务器远程连接的安全。

### 文件系统安全

加固系统重要文件。在Linux系统中，如果黑客取得超级权限，那么他在操作系统里面就不会再有任何的限制地做任何事情。在这种情况下，一个加固的文件系统将会是保护系统安全的最后一道防线。管理员可通过[chattr](https://baike.baidu.com/item/chattr/9841067?fromModule=lemma_inlink)命令锁定系统一些重要文件或目录。

文件权限检查与修改。如果操作系统当中的重要文件的权限设置不合理，则会对操作系统的安全性，产生最为直接的影响。所以，系统的运行维护人员需要及时的察觉到权限配置不合理的文件和目录，并及时修正，以防安全事件发生。

安全设定/tmp、/var/tmp、/dev/shm。在该[操作系统](https://baike.baidu.com/item/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/192?fromModule=lemma_inlink)当中，其用于存放[临时文件](https://baike.baidu.com/item/%E4%B8%B4%E6%97%B6%E6%96%87%E4%BB%B6/3359209?fromModule=lemma_inlink)的目录，主要有两个，分别为/tmp与/var/tmp。它们有个共同特点，就是所有的用户可读可写和执行，这样就对系统产生了安全隐患。针对这两个目录进行设置，不允许这两个目录下执行[应用程序](https://baike.baidu.com/item/%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F/5985445?fromModule=lemma_inlink)。

### 系统软件安全

绝大多数的服务器遭受攻击是因为系统软件或者应用程序有重大漏洞。黑客通过这些漏洞，可以轻松地侵入服务器。管理员应定期检查并修复漏洞。最常见的做法是升级软件，将软件保持在最新版本状态。这样就可以在一定程度上降低系统被入侵的可能性。












---

## 安装虚拟机软件——以VMware为例

VMware官网：
[VMware by Broadcom - Cloud Computing for the Enterprise](https://www.vmware.com/)

![[Pasted image 20241105001009.png]]

VMware16下载地址：[https://pan.baidu.com/s/14tM3ApjTBXTA80aqmsbUnw?pwd=adc8](https://pan.baidu.com/s/14tM3ApjTBXTA80aqmsbUnw?pwd=adc8)

### 安装：


![](https://i-blog.csdnimg.cn/blog_migrate/35fb020c9525ed84bfb590a801490c48.png)

如果你点击下一步出现了这个页面的话，那就证明你电脑里面已经有vmware。

![](https://i-blog.csdnimg.cn/blog_migrate/687018efee76e86bb47931c7bfef5ad2.png)

到选择位置的时候可以更改安装位置

![](https://i-blog.csdnimg.cn/blog_migrate/4bd2647f1a69dfba1c01b72ff10a21db.png)

新的盘符下可能没有vmware文件夹，可以自己新创建一个，这样可能会好管理。

![](https://i-blog.csdnimg.cn/blog_migrate/7e3d602fb090a298d15ec0d1ced3f94c.png)

到下面图片中的这一个步骤，可以点击许可证，输入密钥就可以使用

**如果直接点击完成的话，可以有试用的时间，也可以使用**

![](https://i-blog.csdnimg.cn/blog_migrate/877935cab2d70e2d198e75c3a7ef8df0.png)
安装好的界面是这样的：

![img](https://free-img.400040.xyz/4/2024/11/04/67288bf4753ce.png)

### Ubuntu 下载

两种方式：

#### **（1）官网下载**

[https://ubuntu.com/download](https://ubuntu.com/download)![img](https://free-img.400040.xyz/4/2024/11/04/67288bf500222.png)

点击[Ubuntu 24.04.1 LTS](https://ubuntu.com/download/desktop)即可开始下载

![img](https://free-img.400040.xyz/4/2024/11/04/67288bf57d0b6.png)

最新版 Ubuntu 24.04.1 LTS 大小为 5.8 GB，由于官网是从国外服务器下载，速度比较慢。

这里推荐另外一种下载方式：

#### **（2）清华镜像网站下载**

**点击**[清华大学开源软件镜像站 - Ubuntu 24.04.1](https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/24.04.1/)页面中的`ubuntu-24.04.1-desktop-amd64.iso`

![img](https://free-img.400040.xyz/4/2024/11/04/67288bf5bd80e.png)

### 创建虚拟机

1、打开VMware Workstation软件，点击**“创建新的虚拟机”**。（或者点击左上角**“文件 -> 新建虚拟机”**）

![img](https://free-img.400040.xyz/4/2024/11/04/67288bf58d892.png)

2、进入导向窗口，选择**“自定义”**选项，进入下一步

![img](https://free-img.400040.xyz/4/2024/11/04/67288be87986b.png)

3、点击**下一步**

**注：选项 硬件兼容性（H）**，这里选择默认值即可，进入下一步（系统会显示与你的选择相兼容的VMware产品及版本的列表，以及你的选择所具有的限制和不可用的功能）

![img](https://free-img.400040.xyz/4/2024/11/04/67288be8d4c01.png)

4、选择“安装程序光盘映像文件”**，点击输入框旁边的**“浏览”**按钮。找到自己前边下载好的镜像，双击选择。

如果能看到如图标注的小字“已检测到Ubuntu 64 位 24.04.1”**，说明安装包是对的，并且可以正常安装，这时点击**“下一步”

![img](https://free-img.400040.xyz/4/2024/11/04/67288be89d5fe.png)

5、设置安装信息：全名和密码随便写，用户名只能用小写字母、数字和破折号，输入完毕后，点击“下一步”

![img](https://free-img.400040.xyz/4/2024/11/04/67288be9195b4.png)

6、虚拟机名称为“Ubuntu24.04.1_64 位”（这个根据个人习惯，随便写），虚拟机的路径自定义，根据自己的实际情况修改，它关系到硬盘空间的大小，建议选择可用空间比较大的盘符。点击“下一步”

![img](https://free-img.400040.xyz/4/2024/11/04/67288be88473f.png)

7、 设置处理器参数，选处理器数量和内核数量建议根据自身处理器情况来。这里处理器数量我设置为4，内核数量为2。

![img](https://free-img.400040.xyz/4/2024/11/04/67288be9753b7.png)

8、 内存选择建议 4 GB，单击“下一步”。

![img](https://free-img.400040.xyz/4/2024/11/04/67288beabd902.png)

9、网络类型这里，使用网络地址转换(NAT)(E)

10、SCSI 控制器类型选择推荐的“LSI Logic”**，点击**“下一步”

![img](https://free-img.400040.xyz/4/2024/11/04/67288beb00495.png)

11、虚拟磁盘类型选择推荐的**“SCSI”**，点击**“下一步”**

![img](https://free-img.400040.xyz/4/2024/11/04/67288bead5852.png)

12、选择“新建虚拟磁盘”，点击“下一步”
![img](https://free-img.400040.xyz/4/2024/11/04/67288bebdd50d.png)

13、设置磁盘容量，并选择“将虚拟磁盘拆分成多个文件”。（这里磁盘大小看个人需求，大于等于推荐的大小）容量默认是 20 GB，这里建议弄大一点，不然空间不够，单击“下一步”**。

![img](https://free-img.400040.xyz/4/2024/11/04/67288bed3b92d.png)

14、磁盘文件命名。（自行修改或默认命名）单击**“下一步”**。

![img](https://free-img.400040.xyz/4/2024/11/04/67288bed03808.png)

15、到这一步虚拟机已经创建完成！可以直接点击“完成”，也可以点击“自定义硬件”，修改内存大小、处理器内核等设置。

![img](https://free-img.400040.xyz/4/2024/11/04/67288bed5b568.png)

16、自定义硬件，可自行修改

![img](https://free-img.400040.xyz/4/2024/11/04/67288bedef47a.png)

注意，到这一步只是把 Ubuntu 的虚拟机创建好了，并不是把 [Ubuntu 系统]([https://so.csdn.net/so/search?q=Ubuntu](https://so.csdn.net/so/search?q=Ubuntu) 系统&spm=1001.2101.3001.7020)安装了，正式的安装需要启动虚拟机。

### 五、Ubuntu 系统安装过程的配置

虚拟机创建好后，可以通过点击下图中两个按钮中的任意一个启动虚拟机

![img](https://free-img.400040.xyz/4/2024/11/04/67288bee4e2d6.png)

启动虚拟机后出现如下界面，即可进入安装界面

![img](https://free-img.400040.xyz/4/2024/11/04/67288bee87bc0.png)

保持默认即可，点击“下一步”

![img](https://free-img.400040.xyz/4/2024/11/04/67288bee8dec2.png)

这里我们选择交换安装（交互安装，系统会对我们进行引导安装）

![img](https://free-img.400040.xyz/4/2024/11/04/67288bef79777.png)

保持默认选项，点击“下一步”

![img](https://free-img.400040.xyz/4/2024/11/04/67288bef799b5.png)

注意这里，_***不用勾选***_，对于初学者来说，我们暂时用不到那么多内容

![img](https://free-img.400040.xyz/4/2024/11/04/67288bf0019da.png)

选择安装方式，保持默认即可，点击“下一步”

![img](https://free-img.400040.xyz/4/2024/11/04/67288befb2a15.png)

设置账户信息

![img](https://free-img.400040.xyz/4/2024/11/04/67288bf0ae372.png)

选择地区，时区选择“shanghai”


确认安装信息，点击“安装”

![img](https://free-img.400040.xyz/4/2024/11/04/67288bf208c90.png)

接下来就是等待安装完成后

点击账号图标，输入密码，即可进入

![](https://free-img.400040.xyz/4/2024/11/04/6728904b5b249.png)


---
参考资料

[Linux_百度百科 (baidu.com)](https://baike.baidu.com/item/Linux/27050)

[虚拟机_百度百科 (baidu.com)](https://baike.baidu.com/item/%E8%99%9A%E6%8B%9F%E6%9C%BA/104440)

[VMware15，16虚拟机安装-CSDN博客](https://blog.csdn.net/qq_37935324/article/details/139378169)

[VMware虚拟机安装Linux-CSDN博客](https://blog.csdn.net/weixin_61536532/article/details/129778310)

[万██的博客 (zhongye1.github.io)](https://zhongye1.github.io/posts/1104.html)
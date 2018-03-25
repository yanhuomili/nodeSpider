var express=require('express');
var segment=require('segment');
var seg=new segment();
seg.useDefault();

var str='今天是你的生日我的中国，清晨我放飞一群白鸽，为你衔来一枚橄榄叶'

var arr=[];
arr=seg.doSegment(str);
console.log(arr);

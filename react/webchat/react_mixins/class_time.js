module.exports = {
    classTimeWord: function(data) {
        // 课时文案
        var classTimeWord = '';
        // 标识下只有备注的情况
        var onlyRemark = true;

        if(data.class_type == 1) { // 天
            if(data.class_day != 0) {
                classTimeWord += data.class_day + '天';
                if(data.class_minutes != 0) {
                    classTimeWord += '/每课时' + data.class_minutes + '分钟';
                }

                onlyRemark = false;
            }
        } else if(data.class_type == 0) { // 课时
            if(data.hour != 0) {
                classTimeWord += data.hour + '课时';
                if(data.class_minutes != 0) {
                    classTimeWord += '/每课时' + data.class_minutes + '分钟';
                }

                onlyRemark = false;
            }
        }

        if(onlyRemark) {
            classTimeWord += data.hour_remark;
        } else {
            classTimeWord += '(' + data.hour_remark + ')';
        }

        return classTimeWord;
    }
};
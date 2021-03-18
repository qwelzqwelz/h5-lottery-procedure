/*
 * @Author: qwelz
 * @Date: 2021-03-18 18:21:53
 * @LastEditors: qwelz
 * @LastEditTime: 2021-03-18 23:15:13
 */

// =============== 设置抽奖信息 ===============

const WINNERS_PERCENT_DICT = {
    1: 0.06,
    2: 0.15,
    3: 0.32,
};
var controller;

function get_people_info() {
    const result = [];
    $("#people-list-textarea")
        .val()
        .split("\n")
        .forEach((line) => {
            line = line.trim();
            if (line === "") {
                return null;
            }
            result.push(line);
        });

    return result;
}

function get_awards_num() {
    const result = [];
    for (let i = 0; i < 3; ++i) {
        result[i] = $(`#winners-${i + 1}-num-input`).val();
        result[i] = parseInt(result[i]);
    }

    return result;
}

$("#people-list-textarea").bind("input propertychange", function () {
    const people = get_people_info();
    Object.keys(WINNERS_PERCENT_DICT).forEach((key) => {
        $(`#winners-${key}-num-input`).val(Math.ceil(WINNERS_PERCENT_DICT[key] * people.length));
    });
});

$("#settings-modal form").submit(function (e) {
    e.preventDefault();
    const people = get_people_info(),
        awards = get_awards_num();
    //
    if (people.length < awards[0] + awards[1] + awards[2]) {
        alert("奖项数必须小于人员数");
        return null;
    }
    //
    controller = new DisplayPersonBoxes(people, awards);
    $("[data-target^='#winners-']").each(function () {
        const elem = $(this),
            index = parseInt(elem.attr("data-target").split("-")[1]) - 1;
        elem.text(`${elem.text()} (${awards[index]})`);
    });
    //
    $("#settings-button").hide();
    $("#start-button").show();
    $("#settings-modal").modal("hide");
});

// =============== 开始抽奖 ===============

$("#start-button").click(function () {
    $(this).hide();
    $("#on-selecting-button").show();
    controller.run();
});

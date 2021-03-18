/*
 * @Author: qwelz
 * @Date: 2021-03-18 18:21:53
 * @LastEditors: qwelz
 * @LastEditTime: 2021-03-19 00:06:46
 */

const BOX_PADDING = 30;
const WAIT_M_SECONDS = [100, 200, 400, 800, 1600];
const CN_NUM = "一二三四五六七八九十";

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

class DisplayPersonBoxes {
    constructor(people, awards) {
        this.container = $("#boxes-container-div");
        this.awards = awards;
        this.people = [];
        //
        this.width = null;
        this.left_num = people.length;
        this.left_awards = [0, 1, 2];
        this.current_index = 0;
        this.steps_queue = [];
        //
        const that = this;
        people.forEach((name) => that.people.push({ name }));
        this.init_boxes();
    }

    _calc_box_num(width) {
        let result = Math.floor((this.container.width() - BOX_PADDING) / (width + BOX_PADDING));
        result += Math.floor(this.container.height() / (width + BOX_PADDING));
        result = 2 * result - 4;
        return result;
    }

    _calc_box_width() {
        let result = 100;
        while (this._calc_box_num(result) < this.people.length) {
            result -= 2;
        }

        return result;
    }

    _calc_rectangle_size(width) {
        const box_num = this.people.length;
        let height_c = Math.ceil(box_num / 4) + 1;
        while (height_c * (width + BOX_PADDING) > this.container.height()) {
            --height_c;
        }
        let width_c = Math.ceil((box_num - 2 * height_c) / 2 + 2);
        return [width_c, height_c];
    }

    init_boxes() {
        this.width = this._calc_box_width();
        const [width_c, height_c] = this._calc_rectangle_size(this.width),
            offset = [
                BOX_PADDING,
                this.container.width() / 2 - (width_c / 2) * (BOX_PADDING + this.width) + BOX_PADDING / 2,
            ];
        //
        const length = this.people.length,
            index_list = [
                0,
                width_c - 1,
                width_c + height_c - 2,
                width_c * 2 + height_c - 3,
                width_c * 2 + height_c * 2 - 4,
            ];
        for (let i = 0; i < 4; ++i) {
            for (let index = index_list[i]; index < index_list[i + 1] && index < length; ++index) {
                this.people[index].offset = offset.slice();
                offset[i % 2 ? 0 : 1] += (i < 2 ? 1 : -1) * (BOX_PADDING + this.width);
            }
        }

        //
        const that = this;
        this.people.forEach((person, index) => {
            that.container.append(
                $(`
                <div data-index="${index}" class="person-box">${person.name}</div>
            `).css({
                    width: that.width,
                    height: that.width,
                    top: person.offset[0],
                    left: person.offset[1],
                })
            );
        });
    }

    async _run_jumping_loop(level) {
        const that = this;
        let m_seconds;
        while ((m_seconds = that.steps_queue.shift())) {
            that.current_index = (1 + that.current_index) % that.people.length;
            let box = $(`div.person-box[data-index='${that.current_index}']`);
            while (box.hasClass("selected")) {
                that.current_index = (1 + that.current_index) % that.people.length;
                box = $(`div.person-box[data-index='${that.current_index}']`);
            }
            //
            $("div.person-box").removeClass("passing-by");
            box.addClass("passing-by");
            await sleep(m_seconds);
        }
        $(`div.person-box[data-index='${that.current_index}']`)
            .addClass("latest-selected")
            .addClass("selected")
            .addClass(`winner-${level + 1}`);
        await sleep(1000);
    }

    async _select_next(level) {
        const that = this;
        let steps = Math.floor(Math.random() * this.left_num);
        while (steps <= WAIT_M_SECONDS.length) {
            steps += this.left_num;
        }
        //
        $("div.person-box").removeClass("latest-selected");
        for (let i = 0, length = steps - WAIT_M_SECONDS.length; i < length; ++i) {
            this.steps_queue.push(WAIT_M_SECONDS[0]);
        }
        WAIT_M_SECONDS.forEach((m_seconds) => that.steps_queue.push(m_seconds));
        await this._run_jumping_loop(level);
    }

    async run() {
        const that = this,
            level = this.left_awards.pop();
        console.log(`抽取奖项，index=${level}`);
        if (level === null) {
            return null;
        }
        $("#on-selecting-button span.description").text(`正在抽取 ${CN_NUM.charAt(level)}等奖`);
        $(`#winners-${level + 1}`).collapse("show");
        for (let j = this.awards[level]; j > 0; --j) {
            await this._select_next(level);
            $(`#winners-${level + 1} .card-body`).append($(`<span>${that.people[that.current_index].name}</span>`));
        }
        // 按钮
        $("#on-selecting-button").hide();
        $("#start-button").show();
        if (this.left_awards.length === 0) {
            $("#start-button").text("全部奖项抽取完成").prop("disabled", true);
        }
    }
}

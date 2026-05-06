from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import textwrap


OUT = Path(__file__).with_name("AdCue_Product_Design_Document.pdf")


@dataclass
class Block:
    kind: str
    text: str


def pdf_utf16(text: str) -> str:
    data = b"\xfe\xff" + text.encode("utf-16-be")
    return "<" + data.hex().upper() + ">"


def escape_ascii(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def text_width_units(text: str) -> float:
    units = 0.0
    for ch in text:
        if ch == " ":
            units += 0.45
        elif ord(ch) < 128:
            units += 0.55
        else:
            units += 1.0
    return units


def wrap_text(text: str, max_units: float) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        paragraph = paragraph.strip()
        if not paragraph:
            lines.append("")
            continue

        current = ""
        current_units = 0.0
        for ch in paragraph:
            units = text_width_units(ch)
            if current and current_units + units > max_units:
                lines.append(current)
                current = ch
                current_units = units
            else:
                current += ch
                current_units += units
        if current:
            lines.append(current)
    return lines


content: list[Block] = [
    Block("cover_title", "AdCue"),
    Block("cover_subtitle", "产品设计说明文档"),
    Block("cover_meta", "Tencent Video Ads Challenge · AI 剧情广告体验编排方案"),
    Block(
        "quote",
        "核心主张：Ads that know when to appear. AI 先读懂整集剧情，生成广告机会地图，让广告在合适的时机、以合适的方式出现。",
    ),
    Block("h1", "1. 产品概述"),
    Block(
        "p",
        "AdCue 是面向长视频平台的 AI 广告体验编排系统。它不是单纯的广告生成器，而是一套从内容理解、机会地图生成、实时轻量判断到剧情彩蛋广告展示的完整产品机制。",
    ),
    Block(
        "p",
        "传统贴片广告多按固定时间或库存策略插入，容易在剧情高潮、情绪敏感、信息密集的段落打断用户。AdCue 的目标是让广告先理解剧情语境，再决定是否出现、何时出现、以什么形态出现。",
    ),
    Block(
        "bullets",
        "产品定位：AI 驱动的视频广告体验编排系统\n核心对象：长视频平台、广告运营、品牌广告主、内容版权方\n核心体验：广告从“剧情打断器”变成“剧情彩蛋”\n产品名称：AdCue，含义是广告出现的剧情 cue",
    ),
    Block("h1", "2. 用户需求分析"),
    Block(
        "h2",
        "2.1 用户侧需求",
    ),
    Block(
        "bullets",
        "少打扰：不希望剧情高潮、告白、病房、冲突等高情绪段落被广告切断\n更相关：广告最好与当前场景、人物行为、生活语境有关\n有选择：用户可以领取、忽略、继续观看，而不是被迫等待\n可理解：用户能感知平台在保护观看体验，而不是只追求广告曝光",
    ),
    Block("h2", "2.2 平台侧需求"),
    Block(
        "bullets",
        "降低广告负反馈：减少因强插广告带来的跳出、投诉和会员抵触\n提升库存价值：将普通广告位升级为可解释、可互动、可转化的剧情广告机会\n控制成本：整集预分析一次，多用户复用，实时侧只做轻量判断\n保护内容体验：在敏感剧情、版权边界、品牌安全场景下具备禁入能力",
    ),
    Block("h2", "2.3 广告主需求"),
    Block(
        "bullets",
        "进入语境：品牌出现不再是突兀贴片，而是进入剧情生活场景\n提升记忆：与场景关联的广告更容易被记住\n提高互动：优惠券、风格切换、片尾互动等机制提升点击意愿\n可控投放：品牌安全、频控、人群偏好和内容禁入规则可配置",
    ),
    Block("h1", "3. 产品设计思路"),
    Block(
        "p",
        "AdCue 的设计思路是将“广告投放”前移为“广告编排”。系统不在用户暂停时才临时理解画面，而是在视频上线前先读取整集内容，形成一张可复用的广告机会地图。用户观看时，系统只读取当前时间点的机会地图结果，并结合用户行为、频控、遮挡检查等规则做轻量判断。",
    ),
    Block(
        "bullets",
        "第一步：整集预分析，理解剧情结构、情绪曲线、场景标签和敏感段落\n第二步：生成广告机会地图，标注可广告、轻广告、禁止广告\n第三步：用户观看时轻量判断，结合暂停、播放、频控和遮挡规则\n第四步：在合适节点展示剧情彩蛋广告，或在禁入区明确不展示\n第五步：记录用户反馈，优化后续广告类型、频次和展示方式",
    ),
    Block("h1", "4. 功能架构"),
    Block(
        "h2",
        "4.1 内容预处理模块",
    ),
    Block(
        "bullets",
        "输入：字幕文件、剧情简介、关键帧、音频情绪、场景切分\n处理：剧情结构识别、人物关系识别、情绪强度分析、敏感场景识别\n输出：剧情结构、情绪曲线、广告禁入区、低打扰广告点、可匹配商品类型",
    ),
    Block("h2", "4.2 广告机会地图模块"),
    Block(
        "bullets",
        "可广告：片头、片尾、环境镜头、低对白稳定段落\n轻广告：生活化转场、用户主动暂停、物品交接、低动作段落\n禁止广告：人物冲突、病房探视、家庭照护、关键告白、悬念揭晓前后\n每个节点包含：时间点、剧情阶段、情绪等级、推荐广告类型、禁入原因、展示形态",
    ),
    Block("h2", "4.3 实时决策模块"),
    Block(
        "bullets",
        "读取当前时间点的机会地图结果\n判断用户行为：主动暂停、继续播放、拖动进度、片尾停留\n执行频控检查：用户短时间内是否已接受过广告\n执行遮挡检查：是否遮挡人物、字幕、关键信息\n输出最终决策：展示剧情彩蛋、展示互动广告、或不展示广告",
    ),
    Block("h2", "4.4 广告创意生成模块"),
    Block(
        "bullets",
        "根据当前剧情场景生成轻量广告文案\n支持多种风格：温柔版、弹幕版、品牌版\n支持多种广告形态：右下角浮层、片尾互动、优惠券、可关闭提示\n支持品牌安全过滤：敏感剧情不生成商业化文案",
    ),
    Block("h1", "5. AI 能力说明"),
    Block(
        "bullets",
        "剧情理解：识别剧情阶段、人物行为、场景氛围和情绪曲线\n时机判断：判断当前节点是否适合广告，以及适合哪种广告强度\n广告匹配：根据场景语义匹配热饮、便利店、本地生活、家清、会员权益等类型\n文案生成：生成符合剧情语境的短文案，并支持不同语气版本\n风险控制：识别医疗、照护、冲突、告白等高敏感内容，自动进入广告禁入区\n成本优化：整集预分析结果可复用，实时侧只做轻量规则判断",
    ),
    Block("h1", "6. 原型说明"),
    Block(
        "p",
        "本次 Demo 使用《漫长的季节》第 1 集素材作为参考体验场景。原型重点不是复刻完整播放平台，而是让评委能直接体验同一段视频中“传统广告”和“AdCue 广告”的差异。",
    ),
    Block(
        "bullets",
        "主 Demo：展示完整产品逻辑，包括整集预分析、广告机会地图、轻量判断和剧情彩蛋广告\n录屏体验版：用于展示视频录制，用户可选择剧情卡片并分别体验传统广告和 AdCue 广告\n传统广告侧：无论剧情状态如何，固定弹出贴片广告，展示打断感\nAdCue 侧：根据剧情卡片判断是否允许广告，禁止区不展示，机会点展示右下角轻量浮层\n互动能力：领取优惠券、换广告风格、继续看剧",
    ),
    Block("h1", "7. 典型体验流程"),
    Block(
        "bullets",
        "用户选择“医院病房探视”：传统广告会强插，AdCue 判断为禁止广告，不展示\n用户选择“社区送水寒暄”：传统广告仍会打断，AdCue 展示热饮券剧情彩蛋\n用户选择“家庭照护”：AdCue 判断为高敏感情绪区，不展示广告\n用户选择“社区环境镜头”：AdCue 展示可关闭的本地生活服务入口",
    ),
    Block("h1", "8. 落地规划"),
    Block("h2", "阶段一：规则化 Demo 验证"),
    Block(
        "bullets",
        "使用人工标注或模拟 JSON 生成机会地图\n验证用户是否理解“广告机会地图”的产品概念\n验证轻量浮层是否比贴片更容易被接受",
    ),
    Block("h2", "阶段二：半自动内容预分析"),
    Block(
        "bullets",
        "接入字幕、剧情简介、关键帧和音频情绪分析\nAI 自动生成初版机会地图，运营人员审核后上线\n建立禁入区规则库和品牌安全规则库",
    ),
    Block("h2", "阶段三：平台级投放能力"),
    Block(
        "bullets",
        "将机会地图接入广告投放系统和频控系统\n根据用户偏好、会员状态、广告主目标动态选择广告形态\n接入 A/B 测试，评估完播率、互动率、负反馈率和转化率",
    ),
    Block("h2", "阶段四：规模化商业化"),
    Block(
        "bullets",
        "沉淀剧集、综艺、短剧等多内容类型的广告机会模板\n支持品牌定制剧情彩蛋广告包\n支持广告主按场景、情绪、剧情节点购买高质量机会点",
    ),
    Block("h1", "9. 风险与边界"),
    Block(
        "bullets",
        "版权边界：仅在平台授权素材和合规广告库存内运行\n品牌安全：敏感剧情、医疗照护、强冲突、悲伤段落默认禁入\n用户体验：所有轻广告默认可关闭，不遮挡人物、字幕和关键信息\n隐私保护：实时判断优先使用内容侧和行为侧轻量信号，不依赖敏感个人信息\n成本控制：避免每次暂停都调用大模型，优先复用整集预分析结果",
    ),
    Block("h1", "10. 总结"),
    Block(
        "quote",
        "AdCue 的核心不是让广告更精准地打扰用户，而是让广告学会看场合。",
    ),
    Block(
        "p",
        "通过整集预分析、广告机会地图和实时轻量判断，AdCue 将传统视频广告从“按时间插入”升级为“按剧情节奏出现”。它同时服务用户体验、平台库存价值、广告主品牌记忆和工程成本控制，是一个更成熟、更可落地的视频广告体验编排方案。",
    ),
]


PAGE_W = 595
PAGE_H = 842
MARGIN_X = 56
MARGIN_TOP = 64
MARGIN_BOTTOM = 58
BODY_SIZE = 11
LINE_H = 18


def build_pages(blocks: list[Block]) -> list[list[tuple[str, int, str]]]:
    pages: list[list[tuple[str, int, str]]] = []
    current: list[tuple[str, int, str]] = []
    y_used = 0

    def need(space: int) -> None:
        nonlocal current, y_used
        if y_used + space > PAGE_H - MARGIN_TOP - MARGIN_BOTTOM:
            pages.append(current)
            current = []
            y_used = 0

    for block in blocks:
        if block.kind == "cover_title":
            need(72)
            current.append((block.kind, 34, block.text))
            y_used += 58
        elif block.kind == "cover_subtitle":
            current.append((block.kind, 20, block.text))
            y_used += 34
        elif block.kind == "cover_meta":
            current.append((block.kind, 12, block.text))
            y_used += 44
        elif block.kind == "h1":
            need(46)
            current.append((block.kind, 18, block.text))
            y_used += 36
        elif block.kind == "h2":
            need(32)
            current.append((block.kind, 14, block.text))
            y_used += 26
        elif block.kind == "quote":
            lines = wrap_text(block.text, 42)
            need(24 + len(lines) * LINE_H)
            for line in lines:
                current.append((block.kind, 12, line))
                y_used += LINE_H
            y_used += 14
        elif block.kind == "bullets":
            for raw in block.text.split("\n"):
                wrapped = wrap_text(raw, 44)
                need(len(wrapped) * LINE_H + 4)
                for i, line in enumerate(wrapped):
                    prefix = "• " if i == 0 else "  "
                    current.append((block.kind, BODY_SIZE, prefix + line))
                    y_used += LINE_H
                y_used += 2
            y_used += 8
        else:
            lines = wrap_text(block.text, 47)
            need(len(lines) * LINE_H + 10)
            for line in lines:
                current.append((block.kind, BODY_SIZE, line))
                y_used += LINE_H
            y_used += 8

    if current:
        pages.append(current)
    return pages


def content_stream(page: list[tuple[str, int, str]], page_no: int, total: int) -> bytes:
    ops: list[str] = []
    y = PAGE_H - MARGIN_TOP
    ops.append("BT")
    ops.append("/F1 10 Tf")
    ops.append(f"1 0 0 1 {MARGIN_X} {PAGE_H - 34} Tm")
    ops.append(f"{pdf_utf16('AdCue 产品设计说明文档')} Tj")
    ops.append("ET")

    for kind, size, text in page:
        if kind == "cover_title":
            y = PAGE_H - 176
        color = "0.08 0.09 0.10" if kind in {"h1", "h2", "cover_title", "cover_subtitle"} else "0.26 0.29 0.32"
        if kind == "quote":
            color = "0.12 0.14 0.16"
        x = MARGIN_X
        if kind == "bullets" and text.startswith("  "):
            x = MARGIN_X + 16
        ops.append("BT")
        ops.append(f"{color} rg")
        ops.append(f"/F1 {size} Tf")
        ops.append(f"1 0 0 1 {x} {y} Tm")
        ops.append(f"{pdf_utf16(text)} Tj")
        ops.append("ET")
        y -= int(size * 1.55)
        if kind in {"h1", "cover_meta"}:
            y -= 10
        if kind == "cover_title":
            y -= 4

    ops.append("BT")
    ops.append("0.45 0.47 0.50 rg")
    ops.append("/F1 9 Tf")
    ops.append(f"1 0 0 1 {PAGE_W - 106} 34 Tm")
    ops.append(f"{pdf_utf16(f'{page_no} / {total}')} Tj")
    ops.append("ET")
    return "\n".join(ops).encode("ascii")


def make_pdf() -> bytes:
    pages = build_pages(content)
    objects: list[bytes] = []

    def add(obj: str | bytes) -> int:
        objects.append(obj.encode("latin-1") if isinstance(obj, str) else obj)
        return len(objects)

    catalog_id = add("<< /Type /Catalog /Pages 2 0 R >>")
    pages_id = add(b"")
    font_id = add(
        "<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H "
        "/DescendantFonts [4 0 R] >>"
    )
    cid_font_id = add(
        "<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light "
        "/CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 2 >> >>"
    )

    page_ids: list[int] = []
    stream_ids: list[int] = []
    total = len(pages)
    for idx, page in enumerate(pages, start=1):
        stream = content_stream(page, idx, total)
        stream_id = add(b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream")
        page_id = add(
            f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
            f"/Resources << /Font << /F1 {font_id} 0 R >> >> /Contents {stream_id} 0 R >>"
        )
        stream_ids.append(stream_id)
        page_ids.append(page_id)

    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    objects[pages_id - 1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("latin-1")

    pdf = bytearray()
    pdf.extend(b"%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")
    offsets = [0]
    for i, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{i} 0 obj\n".encode("ascii"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n".encode("ascii"))
    pdf.extend(f"startxref\n{xref}\n%%EOF\n".encode("ascii"))
    return bytes(pdf)


if __name__ == "__main__":
    OUT.write_bytes(make_pdf())
    print(OUT)

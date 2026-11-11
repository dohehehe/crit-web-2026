import Link from "next/link";
import { AnalyticsSectionTabs } from "@/components/admin/analytics/analytics-section-tabs";
import { getSectionViewList } from "@/lib/analytics/getSectionViewList";
import {
  ANALYTICS_RANGES,
  getVercelWebAnalytics,
  resolveAnalyticsRange,
} from "@/lib/analytics/getVercelWebAnalytics";
import tabStyles from "@/components/admin/shared/admin-category-tabs.module.css";
import styles from "@/app/admin/analytics/page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "통계",
};

function formatCount(value) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDay(isoDate) {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${year}.${month}.${day}`;
}

function RangeLink({ href, selected, children }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={selected}
      className={`${styles.range} menu-en${selected ? ` ${styles.rangeActive}` : ""}`}
    >
      {children}
    </Link>
  );
}

function RangeSwitch({ selectedId }) {
  return (
    <div className={styles.ranges} role="tablist" aria-label="통계 기간">
      <div className={styles.rangeGroup}>
        {ANALYTICS_RANGES.map((range) => (
          <RangeLink
            key={range.id}
            href={range.id === "7" ? "/admin/analytics" : `/admin/analytics?range=${range.id}`}
            selected={range.id === selectedId}
          >
            {range.label}
          </RangeLink>
        ))}
      </div>
      <RangeLink href="/admin/analytics?range=all" selected={selectedId === "all"}>
        전체
      </RangeLink>
    </div>
  );
}

function PostRankTable({ posts }) {
  if (posts.length === 0) {
    return <p className={`${styles.empty} p`}>이 기간에 글 조회 기록이 없습니다.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>많이 본 글</caption>
        <thead>
          <tr>
            <th scope="col">순위</th>
            <th scope="col">글</th>
            <th scope="col">페이지뷰</th>
            <th scope="col">방문자</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr key={`${post.href}-${index}`}>
              <td className={styles.rank}>{index + 1}</td>
              <th scope="row">
                <Link href={post.href} className={styles.postTitle}>
                  {post.title}
                </Link>
                {post.meta ? <span className={styles.postMeta}>{post.meta}</span> : null}
              </th>
              <td>{formatCount(post.pageviews)}</td>
              <td>{formatCount(post.visitors)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionPostTable({ posts }) {
  if (posts.length === 0) {
    return <p className={`${styles.empty} p`}>표시할 게시물이 없습니다.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>섹션별 글 조회수</caption>
        <thead>
          <tr>
            <th scope="col">글</th>
            <th scope="col">조회수</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <th scope="row">
                {post.href !== "/" ? (
                  <Link href={post.href} className={styles.postTitle}>
                    {post.title}
                  </Link>
                ) : (
                  <span className={styles.postTitle}>{post.title}</span>
                )}
                {post.meta ? <span className={styles.postMeta}>{post.meta}</span> : null}
              </th>
              <td>{formatCount(post.views)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricTable({ caption, rows, labelHeading }) {
  if (rows.length === 0) {
    return <p className={`${styles.empty} p`}>이 기간에 기록이 없습니다.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{labelHeading}</th>
            <th scope="col">페이지뷰</th>
            <th scope="col">방문자</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{labelHeading === "날짜" ? formatDay(row.label) : row.label}</th>
              <td>{formatCount(row.pageviews)}</td>
              <td>{formatCount(row.visitors)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortLink({ href, selected, children }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={selected}
      className={`${tabStyles.tab} tag-category${selected ? ` ${tabStyles.tabActive}` : ""}`}
    >
      {children}
    </Link>
  );
}

function SortSwitch({ sectionId, sort }) {
  const base = `/admin/analytics?range=all&section=${sectionId}`;

  return (
    <div className={tabStyles.tabs} role="tablist" aria-label="정렬">
      <SortLink href={base} selected={sort !== "views"}>
        날짜순
      </SortLink>
      <SortLink href={`${base}&sort=views`} selected={sort === "views"}>
        조회수
      </SortLink>
    </div>
  );
}

async function AllTimeViews({ sectionId, sort }) {
  const list = await getSectionViewList(sectionId, sort);

  return (
    <>
      <div className={styles.allToolbar}>
        <AnalyticsSectionTabs
          sections={list.sections}
          selectedId={list.section?.id ?? null}
          sort={sort}
        />
        {list.section ? <SortSwitch sectionId={list.section.id} sort={sort} /> : null}
      </div>
      {list.viewsError ? (
        <p className={`${styles.error} p`} role="alert">
          {list.viewsError}
        </p>
      ) : null}
      {list.section ? (
        <SectionPostTable posts={list.posts} />
      ) : (
        <p className={`${styles.empty} p`}>섹션을 선택하면 글 목록이 표시됩니다.</p>
      )}
    </>
  );
}

export default async function AdminAnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const rangeValue = typeof params.range === "string" ? params.range : "";
  const isAll = rangeValue === "all";
  const range = resolveAnalyticsRange(rangeValue);
  const report = isAll ? null : await getVercelWebAnalytics(range.days);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className="title-1">통계</h1>
        <p className="p">
          {isAll ? "전체 기간" : `${formatDay(report.since)} – ${formatDay(report.until)}`}
        </p>
      </header>

      <RangeSwitch selectedId={isAll ? "all" : report.range.id} />

      {isAll ? (
        <AllTimeViews
          sectionId={typeof params.section === "string" ? params.section : ""}
          sort={params.sort === "views" ? "views" : "date"}
        />
      ) : report.ok ? (
        <>
          <section className={styles.summary} aria-label="요약">
            <article className={styles.card}>
              <p className={styles.cardLabel}>페이지뷰</p>
              <p className={styles.cardValue}>{formatCount(report.pageviews)}</p>
            </article>
            <article className={styles.card}>
              <p className={styles.cardLabel}>방문자</p>
              <p className={styles.cardValue}>{formatCount(report.visitors)}</p>
            </article>
          </section>

          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} menu-kr`}>많이 본 글</h2>
            <PostRankTable posts={report.posts ?? []} />
          </section>

          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} menu-kr`}>일자별</h2>
            <MetricTable caption="일자별 방문" rows={report.days} labelHeading="날짜" />
          </section>

          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} menu-kr`}>유입</h2>
            <MetricTable caption="유입 경로" rows={report.referrers} labelHeading="유입" />
          </section>
        </>
      ) : (
        <p className={`${styles.error} p`} role="alert">
          {report.error}
        </p>
      )}
    </main>
  );
}

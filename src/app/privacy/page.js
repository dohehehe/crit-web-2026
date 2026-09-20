import styles from "@/components/auth/AuthForm.module.css";

export default function PrivacyPage() {
  return (
    <main>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className="menu-kr">개인정보 수집 및 이용 동의</h1>
        </header>
        <div className={styles.content}>
          <div className={`p ${styles.paragraph}`}>
            (주)Crit(이하 "회사")는 회원가입 및 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다. 내용을 자세히 읽으신 후 동의 여 부를 결정해 주시기 바랍니다.
          </div>
          <div className={`p ${styles.paragraph}`}>
            <b>1. 수집하는 개인정보 항목</b>
            <p>– 필수 항목: 이름, 이메일 주소, 비밀번호</p>
          </div>
          <div className={`p ${styles.paragraph}`}>
            <b>2. 개인정보의 수집 및 이용 목적</b>
            <p>– 회원 가입 의사 확인 및 본인 인증</p>
            <p>– 서비스 제공을 위한 회원 식별 및 관리</p>
            <p>– 공지사항 전달, 고객 문의 및 불만 처리 등 민원 처리</p>
            <p>– 부정 이용 방지 및 비인가 사용 방지</p>
          </div>
          <div className={`p ${styles.paragraph}`}>
            <b>3. 개인정보의 보유 및 이용 기간</b>
            <p>– 회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.</p>
            <p>– 다만 관계 법령에 따라 보존할 필요가 있는 경우, 해당 법령에서 정한 기간 동안 보관합니다.</p>
          </div>
          <div className={`p ${styles.paragraph}`}>
            <b>4. 동의 거부 권리 및 불이익 안내</b>
            <p>이용자는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 다만 위 필수 항목에 대한 동의를 거부하실 경우 회원가입 및 서비스 이용이 제한 될 수 있습니다.</p>
          </div>
          <div className={`p ${styles.paragraph}`}>
            <b>5. 개인정보 보호책임자</b>
            <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
          </div>
          <div className={styles.paragraph}>
            <p>성명: 이진실 / 연락처: 02-000-0000</p>
            <p>journal.crit@gmail.com</p>
          </div>
          <div className={`p ${styles.paragraph}`}>
            <p>정보주체께서는 (주)Crit의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책 임자 및 담당부서로 문의하실 수 있습니다. 회사는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
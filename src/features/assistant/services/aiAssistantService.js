/**
 * Pure client-side explainable algorithm for matching student profile with job skills.
 * Guarantees no hallucination: strictly uses known student skills and JD requirements.
 */
export function analyzeResumeJDMatch(studentSkills, jobSkills, jobTitle) {
  const normalizedStudent = studentSkills.map((s) => s.trim().toLowerCase());
  const matchedSkills = [];
  const missingSkills = [];

  jobSkills.forEach((jobSkill) => {
    const isMatched = normalizedStudent.some(
      (s) =>
        s === jobSkill.toLowerCase() ||
        s.includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(s),
    );
    if (isMatched) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  });

  const totalRequired = jobSkills.length;
  const matchRatio = totalRequired > 0 ? matchedSkills.length / totalRequired : 0.8;
  const score = Math.min(98, Math.max(25, Math.round(matchRatio * 100)));

  const recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push(
      `Familiarize yourself with ${missingSkills.slice(0, 2).join(" & ")} fundamentals before applying.`,
    );
  }
  if (matchedSkills.length > 0) {
    recommendations.push(
      `Feature projects showcasing ${matchedSkills.slice(0, 3).join(", ")} prominently in the top third of your resume.`,
    );
  }
  recommendations.push(
    `Align your application summary with ${jobTitle} responsibilities and emphasize problem-solving metrics.`,
  );

  const summary =
    score >= 75
      ? `Strong alignment: You have ${matchedSkills.length} out of ${totalRequired} core skills required for ${jobTitle}.`
      : `Moderate fit: You meet ${matchedSkills.length} of ${totalRequired} core skills. Bridging ${missingSkills.join(", ")} will significantly boost your profile.`;

  return {
    score,
    matchedSkills,
    missingSkills,
    recommendations,
    summary,
  };
}

/**
 * Generates tailored outreach cold emails for recruiters, professors, or alumni.
 */
export function generateOutreachDraft(params) {
  const { studentName, university, degree, company, role, recipientType, tone, keySkills } = params;
  const skillsList = keySkills.slice(0, 3).join(", ");

  let subject = `Inquiry regarding ${role} at ${company} - ${studentName}`;
  let body = "";

  if (recipientType === "Professor / Research Lead") {
    subject = `Prospective Research Student Inquiry: ${role} - ${studentName}`;
    body = `Dear Professor,

I hope this email finds you well.

My name is ${studentName}, currently pursuing my ${degree} at ${university}. I have been following your lab's publications in technology and applied problem solving with great interest.

I am writing to express my eager interest in the ${role} position at ${company}. Having built hands-on projects utilizing ${skillsList}, I am deeply intrigued by your lab's technical direction.

I have attached my academic CV and GitHub profile for your review. Would you have 10-15 minutes in the coming weeks for a brief discussion on how my background aligns with your ongoing projects?

Thank you for your time and consideration.

Warm regards,
${studentName}
${university}`;
  } else if (recipientType === "Recruiter") {
    if (tone === "Concise") {
      subject = `Application: ${role} (${studentName} - ${university})`;
      body = `Hi Team,

I hope you're having a productive week.

I recently applied for the ${role} position at ${company} and wanted to briefly reach out. I am currently a student at ${university} with proven experience in ${skillsList}.

Given ${company}'s standard of engineering excellence, I am confident my technical problem-solving foundation would add immediate value to the team.

My resume and portfolio are available for your consideration. I look forward to connecting.

Best,
${studentName}`;
    } else {
      subject = `Application & Introduction: ${role} at ${company} - ${studentName}`;
      body = `Hello Recruiting Team,

I hope this message finds you well.

I am writing to express my enthusiasm for the ${role} position at ${company}. As a student at ${university} studying ${degree}, I have cultivated a strong foundation in modern software development, specifically focusing on ${skillsList}.

What excites me most about ${company} is your dedication to high-impact products and engineering standards. In my academic and independent work, I have consistently focused on building scalable, reliable solutions and keeping active coding consistency across competitive platforms.

I would welcome the opportunity to discuss how my skill set and enthusiasm align with ${company}'s goals. Thank you very much for your time and review.

Sincerely,
${studentName}
${university}`;
    }
  } else if (recipientType === "Alumni / Peer") {
    subject = `${university} student reaching out regarding ${company} (${role})`;
    body = `Hi there!

Hope you are doing well! I came across your profile and noticed you are working at ${company}. As a fellow student at ${university} studying ${degree}, it's genuinely inspiring to see what you've achieved.

I am currently preparing an application for the ${role} opening at ${company}. I've been honing my skills in ${skillsList} and active algorithmic problem solving.

If your schedule permits, I would love to ask 2-3 quick questions about your experience at ${company} and any advice you might have for an aspiring engineer.

Thanks a lot for your time!

Best regards,
${studentName}`;
  } else {
    // Engineering Manager
    subject = `Interest in ${role} team at ${company} - ${studentName}`;
    body = `Hi,

I hope you are having a wonderful week.

I am reaching out because I am fascinated by the engineering work ${company} is doing. I am an undergraduate at ${university} with practical proficiency in ${skillsList} and consistent algorithmic problem-solving practice.

I am targeting the ${role} position and would love to contribute to high-reliability engineering challenges within your team.

I would be grateful for the chance to introduce myself and share my work samples. Thank you for your consideration!

Best regards,
${studentName}`;
  }

  return { subject, body };
}

/**
 * Natural language search parser.
 * Converts natural queries like "paid ML internships for sophomore" into structured filters.
 */
export function parseNaturalLanguageQuery(query) {
  const q = query.toLowerCase();

  let detectedType = "All";
  if (q.includes("intern") || q.includes("internship")) detectedType = "Internship";
  else if (q.includes("research") || q.includes("fellowship")) detectedType = "Research";
  else if (q.includes("hackathon") || q.includes("contest")) detectedType = "Hackathon";
  else if (q.includes("full-time") || q.includes("graduate") || q.includes("job")) detectedType = "Full-time";

  let detectedLocation = "All";
  if (q.includes("remote") || q.includes("online")) detectedLocation = "Remote";
  else if (q.includes("hybrid")) detectedLocation = "Hybrid";
  else if (q.includes("onsite") || q.includes("office")) detectedLocation = "Onsite";

  return {
    rawQuery: query,
    detectedType,
    detectedLocation,
  };
}


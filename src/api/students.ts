export type StoryPersona = {
  story_tone: string;
  themes: string[];
  difficulty: string;
  format: string;
  character_role: string;
};

const API_BASE = "https://aibuddy-be-awb3eqfyftc7cbe6.canadacentral-01.azurewebsites.net";
export async function patchStudentPersona(studentId: string, persona: StoryPersona) {
  const res = await fetch(`${API_BASE}/api/students/${encodeURIComponent(studentId)}/persona`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "dev-local-key", // put your API key in .env
    },
    body: JSON.stringify({ story_persona: persona }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

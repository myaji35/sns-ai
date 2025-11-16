'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// LLM API 호출 함수
async function callLLMAPI(
  provider: 'chatgpt' | 'gemini' | 'claude',
  apiKey: string,
  prompt: string,
  topicTitle: string,
  index: number
): Promise<{ title: string; content: string }> {
  try {
    switch (provider) {
      case 'chatgpt':
        // OpenAI API 호출
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: '당신은 SNS 콘텐츠 작성 전문가입니다. 주어진 프롬프트에 따라 매력적이고 효과적인 SNS 콘텐츠를 작성해주세요.'
              },
              {
                role: 'user',
                content: `주제: ${topicTitle}\n\n요구사항:\n${prompt}\n\n위 요구사항에 맞는 SNS 콘텐츠를 작성해주세요. 응답은 다음 JSON 형식으로 해주세요:\n{"title": "콘텐츠 제목", "content": "콘텐츠 본문"}`
              }
            ],
            temperature: 0.8,
          }),
        });

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API 오류: ${openaiResponse.statusText}`);
        }

        const openaiData = await openaiResponse.json();
        const openaiContent = openaiData.choices[0].message.content;

        // JSON 파싱 시도
        try {
          const parsed = JSON.parse(openaiContent);
          return {
            title: parsed.title || `${topicTitle} - 콘텐츠 ${index}`,
            content: parsed.content || openaiContent
          };
        } catch {
          // JSON 파싱 실패 시 전체 응답을 content로 사용
          return {
            title: `${topicTitle} - 콘텐츠 ${index}`,
            content: openaiContent
          };
        }

      case 'gemini':
        // Google Gemini API 호출
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `주제: ${topicTitle}\n\n요구사항:\n${prompt}\n\n위 요구사항에 맞는 SNS 콘텐츠를 작성해주세요. 응답은 다음 JSON 형식으로 해주세요:\n{"title": "콘텐츠 제목", "content": "콘텐츠 본문"}`
              }]
            }],
          }),
        });

        if (!geminiResponse.ok) {
          throw new Error(`Gemini API 오류: ${geminiResponse.statusText}`);
        }

        const geminiData = await geminiResponse.json();
        const geminiContent = geminiData.candidates[0].content.parts[0].text;

        try {
          const parsed = JSON.parse(geminiContent);
          return {
            title: parsed.title || `${topicTitle} - 콘텐츠 ${index}`,
            content: parsed.content || geminiContent
          };
        } catch {
          return {
            title: `${topicTitle} - 콘텐츠 ${index}`,
            content: geminiContent
          };
        }

      case 'claude':
        // Anthropic Claude API 호출
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [{
              role: 'user',
              content: `주제: ${topicTitle}\n\n요구사항:\n${prompt}\n\n위 요구사항에 맞는 SNS 콘텐츠를 작성해주세요. 응답은 다음 JSON 형식으로 해주세요:\n{"title": "콘텐츠 제목", "content": "콘텐츠 본문"}`
            }],
          }),
        });

        if (!claudeResponse.ok) {
          throw new Error(`Claude API 오류: ${claudeResponse.statusText}`);
        }

        const claudeData = await claudeResponse.json();
        const claudeContent = claudeData.content[0].text;

        try {
          const parsed = JSON.parse(claudeContent);
          return {
            title: parsed.title || `${topicTitle} - 콘텐츠 ${index}`,
            content: parsed.content || claudeContent
          };
        } catch {
          return {
            title: `${topicTitle} - 콘텐츠 ${index}`,
            content: claudeContent
          };
        }

      default:
        throw new Error(`지원하지 않는 LLM 제공자: ${provider}`);
    }
  } catch (error) {
    console.error('LLM API 호출 오류:', error);
    throw error;
  }
}
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MemberCompany {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business_number: string | null;
  business_type: string;
  industry: string | null;
  plan_type: string;
  llm_provider?: 'chatgpt' | 'gemini' | 'claude';
  llm_api_key?: string;
}

interface SNSAccount {
  id: string;
  platform: string;
  account_name: string;
  account_id: string;
  status: string;
  follower_count: number;
  post_count: number;
}

interface GoogleSheet {
  id: string;
  sheet_name: string;
  sheet_url: string;
  publish_frequency: string;
  auto_publish: boolean;
  is_active: boolean;
  last_synced_at: string | null;
}

interface ContentQuota {
  id: string;
  month: string; // YYYY-MM format
  quota_limit: number; // 월간 쿼터 한도
  quota_used: number; // 사용된 쿼터
  unit_price: number; // 건당 단가 (원)
  total_cost: number; // 총 비용 (원)
}

interface ContentTopic {
  id: string;
  title: string;
  description: string;
  created_at: string;
  subtopic_count: number;
}

interface GeneratedContent {
  id: string;
  subtitle: string;
  content: string;
  created_at: string;
}

interface ContentSubtopic {
  id: string;
  topic_id: string;
  title: string;
  prompt: string;
  count: number; // 생성할 콘텐츠 개수
  auto_schedule: 'manual' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  schedule_day?: string; // 요일 (weekly, biweekly) 또는 날짜 (monthly)
  created_at: string;
  generated_contents?: GeneratedContent[]; // 실제 생성된 콘텐츠들
}

/**
 * 회원사 상세 페이지
 * SNS 계정 관리, 구글시트 연동, 모니터링
 */
export default function MemberCompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<MemberCompany | null>(null);
  const [snsAccounts, setSnsAccounts] = useState<SNSAccount[]>([]);
  const [googleSheets, setGoogleSheets] = useState<GoogleSheet[]>([]);
  const [contentQuotas, setContentQuotas] = useState<ContentQuota[]>([]);
  const [selectedTab, setSelectedTab] = useState<'info' | 'sns' | 'content' | 'analytics' | 'quota'>('info');
  const [showAddSnsModal, setShowAddSnsModal] = useState(false);
  const [showEditSnsModal, setShowEditSnsModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SNSAccount | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [selectedQuota, setSelectedQuota] = useState<ContentQuota | null>(null);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);

  // 콘텐츠 생성 관련 상태
  const [contentTopics, setContentTopics] = useState<ContentTopic[]>([]);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showSubtopicModal, setShowSubtopicModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ContentTopic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<ContentSubtopic | null>(null); // 편집할 서브토픽
  const [subtopics, setSubtopics] = useState<ContentSubtopic[]>([]);
  const [scheduleType, setScheduleType] = useState<'manual' | 'daily' | 'weekly' | 'biweekly' | 'monthly'>('manual');
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set()); // 펼쳐진 서브토픽 ID 목록

  // 샘플 데이터 (실제 DB 연동으로 대체됨)
  // const SAMPLE_COMPANY = { ... };
  // const SAMPLE_SNS = [ ... ];
  // const SAMPLE_SHEETS = [ ... ];

  const SAMPLE_QUOTAS: ContentQuota[] = [
    {
      id: '1',
      month: '2025-11',
      quota_limit: 100,
      quota_used: 45,
      unit_price: 5000,
      total_cost: 225000,
    },
    {
      id: '2',
      month: '2025-10',
      quota_limit: 100,
      quota_used: 87,
      unit_price: 5000,
      total_cost: 435000,
    },
    {
      id: '3',
      month: '2025-09',
      quota_limit: 80,
      quota_used: 76,
      unit_price: 5000,
      total_cost: 380000,
    },
  ];

  // 샘플 통계 데이터 (최근 7일)
  const SAMPLE_ANALYTICS = [
    { date: '11/09', visitors: 450, likes: 89, comments: 23, shares: 12 },
    { date: '11/10', visitors: 520, likes: 102, comments: 31, shares: 18 },
    { date: '11/11', visitors: 380, likes: 76, comments: 19, shares: 9 },
    { date: '11/12', visitors: 680, likes: 145, comments: 42, shares: 25 },
    { date: '11/13', visitors: 590, likes: 118, comments: 35, shares: 21 },
    { date: '11/14', visitors: 720, likes: 156, comments: 48, shares: 29 },
    { date: '11/15', visitors: 810, likes: 178, comments: 54, shares: 33 },
  ];

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // 1. 회원사 기본 정보 가져오기
      const { data: companyData, error: companyError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', companyId)
        .eq('organization_type', 'member')
        .single();

      if (companyError) throw companyError;
      if (!companyData) {
        console.error('회원사를 찾을 수 없습니다.');
        return;
      }

      setCompany({
        id: companyData.id,
        name: companyData.name,
        email: companyData.email,
        phone: companyData.phone || null,
        business_number: companyData.business_number || null,
        business_type: companyData.business_type || 'individual',
        industry: companyData.industry || null,
        plan_type: companyData.plan_type || 'free',
        llm_provider: companyData.llm_provider || undefined,
        llm_api_key: companyData.llm_api_key || undefined,
      });

      // 2. SNS 계정 정보 가져오기
      const { data: snsData, error: snsError } = await supabase
        .from('member_sns_accounts')
        .select('*')
        .eq('member_company_id', companyId)
        .order('created_at', { ascending: false });

      if (!snsError && snsData) {
        setSnsAccounts(snsData.map((sns: any) => ({
          id: sns.id,
          platform: sns.platform,
          account_name: sns.account_name,
          account_id: sns.account_id,
          status: sns.status || 'active',
          follower_count: sns.follower_count || 0,
          post_count: sns.post_count || 0,
        })));
      }

      // 3. 구글시트 정보 가져오기
      const { data: sheetsData, error: sheetsError } = await supabase
        .from('member_google_sheets')
        .select('*')
        .eq('member_company_id', companyId)
        .order('created_at', { ascending: false });

      if (!sheetsError && sheetsData) {
        setGoogleSheets(sheetsData.map((sheet: any) => ({
          id: sheet.id,
          sheet_name: sheet.sheet_name,
          sheet_url: sheet.sheet_url,
          publish_frequency: sheet.publish_frequency || 'manual',
          auto_publish: sheet.auto_publish || false,
          is_active: sheet.is_active || false,
          last_synced_at: sheet.last_synced_at,
        })));
      }

      // 4. 쿼터 정보는 샘플 데이터 사용 (추후 구현)
      // TODO: 실제 쿼터 테이블 연동 필요
      setContentQuotas(SAMPLE_QUOTAS);

      // 5. 콘텐츠 주제 가져오기
      const { data: topicsData, error: topicsError } = await supabase
        .from('member_content_topics')
        .select('*')
        .eq('member_company_id', companyId)
        .order('created_at', { ascending: false });

      if (!topicsError && topicsData) {
        setContentTopics(topicsData.map((topic: any) => ({
          id: topic.id,
          title: topic.title,
          description: topic.description || '',
          created_at: topic.created_at,
          subtopic_count: 0, // Will be updated when loading subtopics
        })));

        // 6. 각 주제의 서브토픽과 생성된 콘텐츠 가져오기
        const { data: subtopicsData, error: subtopicsError } = await supabase
          .from('calendar_topic_subtopics')
          .select(`
            *,
            subtopic_generated_contents (*)
          `)
          .in('topic_id', topicsData.map((t: any) => t.id))
          .order('created_at', { ascending: false });

        if (!subtopicsError && subtopicsData) {
          setSubtopics(subtopicsData.map((st: any) => ({
            id: st.id,
            topic_id: st.topic_id,
            title: st.title,
            prompt: st.prompt,
            count: st.count,
            auto_schedule: st.auto_schedule,
            schedule_day: st.schedule_day,
            created_at: st.created_at,
            generated_contents: (st.subtopic_generated_contents || []).map((gc: any) => ({
              id: gc.id,
              subtitle: gc.subtitle,
              content: gc.content,
              created_at: gc.created_at,
            })),
          })));

          // Update subtopic counts for topics
          setContentTopics(prev => prev.map(topic => ({
            ...topic,
            subtopic_count: subtopicsData.filter((st: any) => st.topic_id === topic.id).length,
          })));
        }
      }

    } catch (error: any) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformInfo = (platform: string) => {
    const platforms: Record<string, { name: string; icon: string; color: string }> = {
      instagram: { name: 'Instagram', icon: '📷', color: 'from-purple-600 to-pink-500' },
      facebook: { name: 'Facebook', icon: '👥', color: 'from-blue-600 to-blue-700' },
      naver_blog: { name: 'Naver Blog', icon: '📝', color: 'from-green-600 to-green-700' },
      twitter: { name: 'Twitter', icon: '🐦', color: 'from-sky-500 to-sky-600' },
      youtube: { name: 'YouTube', icon: '▶️', color: 'from-red-600 to-red-700' },
    };
    return platforms[platform] || { name: platform, icon: '🔗', color: 'from-gray-600 to-gray-700' };
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      manual: '수동',
      daily: '매일',
      weekly: '주간',
      biweekly: '격주',
      monthly: '월간',
    };
    return labels[freq] || freq;
  };

  const handleEditAccount = (account: SNSAccount) => {
    setSelectedAccount(account);
    setShowEditSnsModal(true);
  };

  const handleSaveEditedSnsAccount = async (formData: any) => {
    if (!selectedAccount) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('member_sns_accounts')
        .update({
          account_name: formData.account_name,
          account_id: formData.account_id,
          status: formData.status,
        })
        .eq('id', selectedAccount.id);

      if (error) throw error;

      // 목록 업데이트
      setSnsAccounts(snsAccounts.map(acc =>
        acc.id === selectedAccount.id
          ? {
              ...acc,
              account_name: formData.account_name,
              account_id: formData.account_id,
              status: formData.status,
            }
          : acc
      ));

      alert('SNS 계정이 수정되었습니다.');
      setShowEditSnsModal(false);
      setSelectedAccount(null);
    } catch (error: any) {
      console.error('SNS 계정 수정 오류:', error);
      alert(`SNS 계정 수정 중 오류가 발생했습니다.\n\n${error?.message || '알 수 없는 오류'}`);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('정말 이 SNS 계정을 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('member_sns_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      setSnsAccounts(snsAccounts.filter(acc => acc.id !== accountId));
      alert('SNS 계정이 삭제되었습니다.');
    } catch (error: any) {
      console.error('SNS 계정 삭제 오류:', error);
      alert(`SNS 계정 삭제 중 오류가 발생했습니다.\n\n${error?.message || '알 수 없는 오류'}`);
    }
  };

  // 주제 관리 핸들러
  const handleSaveTopic = async (formData: any) => {
    try {
      const supabase = createClient();

      const { data: insertedTopic, error } = await supabase
        .from('member_content_topics')
        .insert({
          member_company_id: company.id,
          title: formData.title,
          description: formData.description,
        })
        .select()
        .single();

      if (error) throw error;
      if (!insertedTopic) throw new Error('주제 생성에 실패했습니다');

      const newTopic: ContentTopic = {
        id: insertedTopic.id,
        title: insertedTopic.title,
        description: insertedTopic.description,
        created_at: insertedTopic.created_at,
        subtopic_count: 0,
      };

      setContentTopics([newTopic, ...contentTopics]);
      setShowTopicModal(false);
      alert('주제가 생성되었습니다.');
    } catch (error: any) {
      console.error('주제 생성 오류:', error);
      alert(`주제 생성 중 오류가 발생했습니다.\n\n${error?.message || '알 수 없는 오류'}`);
    }
  };

  const handleDeleteTopic = (topicId: string) => {
    if (!confirm('이 주제와 모든 서브 주제가 삭제됩니다. 계속하시겠습니까?')) return;

    // 주제와 관련된 서브 주제들도 삭제
    setSubtopics(subtopics.filter(st => st.topic_id !== topicId));
    setContentTopics(contentTopics.filter(t => t.id !== topicId));
    alert('주제가 삭제되었습니다.');
  };

  const handleSaveSubtopic = async (formData: any) => {
    if (!selectedTopic) return;

    const count = parseInt(formData.count) || 1;

    if (selectedSubtopic) {
      // 편집 모드: 기존 서브토픽 업데이트
      try {
        const supabase = createClient();

        const { error: updateError } = await supabase
          .from('calendar_topic_subtopics')
          .update({
            prompt: formData.prompt,
            count: count,
            auto_schedule: formData.auto_schedule || 'manual',
            schedule_day: formData.schedule_day || undefined,
          })
          .eq('id', selectedSubtopic.id);

        if (updateError) throw updateError;

        const subtopicData: ContentSubtopic = {
          ...selectedSubtopic,
          prompt: formData.prompt,
          count: count,
          auto_schedule: formData.auto_schedule || 'manual',
          schedule_day: formData.schedule_day || undefined,
        };

        setSubtopics(subtopics.map(st => st.id === selectedSubtopic.id ? subtopicData : st));
        alert('서브 주제가 수정되었습니다.');

        setShowSubtopicModal(false);
        setSelectedTopic(null);
        setSelectedSubtopic(null);
        setScheduleType('manual');
        return;
      } catch (error: any) {
        console.error('서브토픽 업데이트 오류:', error);
        alert(`서브 주제 수정 중 오류가 발생했습니다.\n\n${error?.message || '알 수 없는 오류'}`);
        return;
      }
    }

    // 발행 모드: LLM을 사용해서 실제 콘텐츠 생성
    if (!company?.llm_provider || !company?.llm_api_key) {
      alert('회원사 기본 정보에서 LLM 제공자와 API 키를 먼저 설정해주세요.');
      return;
    }

    try {
      // 발행 시작 알림
      const confirmMsg = `${count}개의 콘텐츠를 생성하시겠습니까?\n\nLLM 제공자: ${company.llm_provider}\n프롬프트: ${formData.prompt.substring(0, 50)}...`;
      if (!confirm(confirmMsg)) {
        return;
      }

      alert(`${count}개의 콘텐츠를 AI로 생성 중입니다...\n\n${company.llm_provider}를 사용합니다.`);

      // 콘텐츠 생성 (실제 LLM API 호출)
      const generatedContents: GeneratedContent[] = [];
      for (let i = 0; i < count; i++) {
        try {
          // 실제 LLM API 호출
          const result = await callLLMAPI(
            company.llm_provider,
            company.llm_api_key,
            formData.prompt,
            selectedTopic.title,
            i + 1
          );

          generatedContents.push({
            id: `${Date.now()}_${i}`,
            subtitle: result.title,
            content: result.content,
            created_at: new Date().toISOString(),
          });

          // 진행 상황 표시를 위한 짧은 딜레이
          if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error: any) {
          console.error(`콘텐츠 ${i + 1} 생성 오류:`, error);
          // 오류 발생 시에도 계속 진행 (fallback 콘텐츠 생성)
          generatedContents.push({
            id: `${Date.now()}_${i}_error`,
            subtitle: `${selectedTopic.title} - 콘텐츠 ${i + 1} (생성 실패)`,
            content: `콘텐츠 생성 중 오류가 발생했습니다.\n\n오류: ${error?.message || '알 수 없는 오류'}\n\n프롬프트: ${formData.prompt}`,
            created_at: new Date().toISOString(),
          });
        }
      }

      // 데이터베이스에 서브토픽 저장
      const supabase = createClient();

      const { data: insertedSubtopic, error: insertError } = await supabase
        .from('calendar_topic_subtopics')
        .insert({
          topic_id: selectedTopic.id,
          title: `${selectedTopic.title} - 발행 완료`,
          prompt: formData.prompt,
          count: count,
          auto_schedule: formData.auto_schedule || 'manual',
          schedule_day: formData.schedule_day || undefined,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (!insertedSubtopic) throw new Error('서브토픽 생성에 실패했습니다');

      // 생성된 콘텐츠를 데이터베이스에 저장
      if (generatedContents.length > 0) {
        const { error: contentsError } = await supabase
          .from('subtopic_generated_contents')
          .insert(
            generatedContents.map(gc => ({
              subtopic_id: insertedSubtopic.id,
              subtitle: gc.subtitle,
              content: gc.content,
            }))
          );

        if (contentsError) throw contentsError;
      }

      // 서브토픽 데이터 (프론트엔드 상태 업데이트용)
      const subtopicData: ContentSubtopic = {
        id: insertedSubtopic.id,
        topic_id: selectedTopic.id,
        title: insertedSubtopic.title,
        prompt: insertedSubtopic.prompt,
        count: insertedSubtopic.count,
        auto_schedule: insertedSubtopic.auto_schedule,
        schedule_day: insertedSubtopic.schedule_day,
        created_at: insertedSubtopic.created_at,
        generated_contents: generatedContents,
      };

      setSubtopics([subtopicData, ...subtopics]);

      // 주제의 서브 주제 카운트 업데이트
      setContentTopics(contentTopics.map(t =>
        t.id === selectedTopic.id
          ? { ...t, subtopic_count: t.subtopic_count + 1 }
          : t
      ));

      alert(`✅ ${count}개의 콘텐츠가 성공적으로 발행되었습니다!\n\nLLM: ${company.llm_provider}\n생성된 서브 콘텐츠:\n${generatedContents.map((c, i) => `${i + 1}. ${c.subtitle}`).join('\n')}`);
    } catch (error: any) {
      console.error('콘텐츠 발행 오류:', error);
      alert(`콘텐츠 발행 중 오류가 발생했습니다.\n\n${error?.message || '알 수 없는 오류'}`);
      return;
    }

    setShowSubtopicModal(false);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setScheduleType('manual');
  };

  const handleDeleteSubtopic = (subtopicId: string, topicId: string) => {
    if (!confirm('정말 이 서브 주제를 삭제하시겠습니까?')) return;

    setSubtopics(subtopics.filter(st => st.id !== subtopicId));

    // 주제의 서브 주제 카운트 업데이트
    setContentTopics(contentTopics.map(t =>
      t.id === topicId
        ? { ...t, subtopic_count: Math.max(0, t.subtopic_count - 1) }
        : t
    ));

    alert('서브 주제가 삭제되었습니다.');
  };

  const toggleSubtopicExpand = (subtopicId: string) => {
    setExpandedSubtopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subtopicId)) {
        newSet.delete(subtopicId);
      } else {
        newSet.add(subtopicId);
      }
      return newSet;
    });
  };

  const handleRepublish = async (subtopic: ContentSubtopic, topic: ContentTopic) => {
    if (!company?.llm_provider || !company?.llm_api_key) {
      alert('회원사 기본 정보에서 LLM 제공자와 API 키를 먼저 설정해주세요.');
      return;
    }

    const confirmMsg = `${subtopic.count}개의 콘텐츠를 재발행하시겠습니까?\n\n기존 콘텐츠는 유지되고 새로운 콘텐츠가 생성됩니다.\n\nLLM 제공자: ${company.llm_provider}`;
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      alert(`${subtopic.count}개의 콘텐츠를 AI로 생성 중입니다...\n\n${company.llm_provider}를 사용합니다.`);

      // 새로운 콘텐츠 생성 (실제 LLM API 호출)
      const newContents: GeneratedContent[] = [];
      for (let i = 0; i < subtopic.count; i++) {
        try {
          // 실제 LLM API 호출
          const result = await callLLMAPI(
            company.llm_provider,
            company.llm_api_key,
            subtopic.prompt,
            topic.title,
            i + 1
          );

          newContents.push({
            id: `${Date.now()}_${i}_republish`,
            subtitle: result.title,
            content: result.content,
            created_at: new Date().toISOString(),
          });

          // 진행 상황 표시를 위한 짧은 딜레이
          if (i < subtopic.count - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error: any) {
          console.error(`콘텐츠 ${i + 1} 생성 오류:`, error);
          // 오류 발생 시에도 계속 진행 (fallback 콘텐츠 생성)
          newContents.push({
            id: `${Date.now()}_${i}_republish_error`,
            subtitle: `${topic.title} - 콘텐츠 ${i + 1} (생성 실패)`,
            content: `콘텐츠 생성 중 오류가 발생했습니다.\n\n오류: ${error?.message || '알 수 없는 오류'}\n\n프롬프트: ${subtopic.prompt}`,
            created_at: new Date().toISOString(),
          });
        }
      }

      // 데이터베이스에 새 콘텐츠 저장
      const supabase = createClient();

      if (newContents.length > 0) {
        const { error: contentsError } = await supabase
          .from('subtopic_generated_contents')
          .insert(
            newContents.map(gc => ({
              subtopic_id: subtopic.id,
              subtitle: gc.subtitle,
              content: gc.content,
            }))
          );

        if (contentsError) throw contentsError;
      }

      // 기존 콘텐츠에 새 콘텐츠 추가 (프론트엔드 상태 업데이트)
      const updatedSubtopic: ContentSubtopic = {
        ...subtopic,
        generated_contents: [
          ...(subtopic.generated_contents || []),
          ...newContents
        ],
      };

      setSubtopics(subtopics.map(st =>
        st.id === subtopic.id ? updatedSubtopic : st
      ));

      const totalContents = (subtopic.generated_contents?.length || 0) + newContents.length;
      alert(`✅ ${subtopic.count}개의 콘텐츠가 AI로 재발행되었습니다!\n\n총 콘텐츠: ${totalContents}개\nLLM: ${company.llm_provider}`);
    } catch (error: any) {
      console.error('재발행 오류:', error);
      alert(`재발행 중 오류가 발생했습니다.\n\n${error?.message || '알 수 없는 오류'}`);
    }
  };

  const handleAddQuota = () => {
    setSelectedQuota(null);
    setShowQuotaModal(true);
  };

  const handleEditQuota = (quota: ContentQuota) => {
    setSelectedQuota(quota);
    setShowQuotaModal(true);
  };

  const handleSaveQuota = (formData: any) => {
    const newQuota: ContentQuota = {
      id: selectedQuota?.id || String(Date.now()),
      month: formData.month,
      quota_limit: parseInt(formData.quota_limit),
      quota_used: selectedQuota?.quota_used || 0,
      unit_price: parseInt(formData.unit_price),
      total_cost: selectedQuota ? selectedQuota.quota_used * parseInt(formData.unit_price) : 0,
    };

    if (selectedQuota) {
      // Update existing quota
      setContentQuotas(contentQuotas.map(q => q.id === selectedQuota.id ? newQuota : q));
      alert('쿼터 정보가 수정되었습니다.');
    } else {
      // Add new quota
      setContentQuotas([newQuota, ...contentQuotas]);
      alert('쿼터가 추가되었습니다.');
    }

    setShowQuotaModal(false);
    setSelectedQuota(null);
  };

  const handleDeleteQuota = (quotaId: string) => {
    if (confirm('정말 이 쿼터 기록을 삭제하시겠습니까?')) {
      setContentQuotas(contentQuotas.filter(q => q.id !== quotaId));
      alert('쿼터 기록이 삭제되었습니다.');
    }
  };

  const handleEditCompany = () => {
    setShowEditCompanyModal(true);
  };

  const handleSaveCompanyInfo = async (formData: any) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          phone: formData.phone || null,
          business_number: formData.business_number || null,
          industry: formData.industry || null,
          plan_type: formData.plan_type,
          llm_provider: formData.llm_provider || null,
          llm_api_key: formData.llm_api_key || null,
        })
        .eq('id', companyId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setCompany({
        ...company!,
        name: formData.name,
        phone: formData.phone || null,
        business_number: formData.business_number || null,
        industry: formData.industry || null,
        plan_type: formData.plan_type,
        llm_provider: formData.llm_provider || undefined,
        llm_api_key: formData.llm_api_key || undefined,
      });

      alert('회원사 정보가 수정되었습니다.');
      setShowEditCompanyModal(false);
    } catch (error: any) {
      console.error('회원사 정보 수정 오류:', error);
      alert(`회원사 정보 수정 중 오류가 발생했습니다.\n\n${error?.message || '알 수 없는 오류'}`);
    }
  };

  const handleAddSnsAccount = () => {
    setShowAddSnsModal(true);
  };

  const handleSaveNewSnsAccount = async (formData: any) => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('member_sns_accounts')
        .insert({
          member_company_id: companyId,
          platform: formData.platform,
          account_name: formData.account_name,
          account_id: formData.account_id,
          status: 'active',
          follower_count: 0,
          post_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // 목록에 추가
      setSnsAccounts([
        {
          id: data.id,
          platform: data.platform,
          account_name: data.account_name,
          account_id: data.account_id,
          status: data.status,
          follower_count: data.follower_count || 0,
          post_count: data.post_count || 0,
        },
        ...snsAccounts,
      ]);

      alert('SNS 계정이 추가되었습니다.');
      setShowAddSnsModal(false);
    } catch (error: any) {
      console.error('SNS 계정 추가 오류:', error);
      alert(`SNS 계정 추가 중 오류가 발생했습니다.\n\n${error?.message || '알 수 없는 오류'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">회원사 정보를 찾을 수 없습니다.</p>
          <Link href="/management" className="mt-4 text-blue-600 hover:text-blue-700">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {company.business_type === 'small_business' && '소상공인'}
                {company.business_type === 'medium_business' && '중소기업'}
                {company.business_type === 'individual' && '개인'}
              </span>
            </div>
            <p className="text-gray-600">{company.email} • {company.business_number}</p>
          </div>
          <Link
            href="/management"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            ← 목록으로
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            {(['info', 'sns', 'content', 'quota', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'info' && '기본 정보'}
                {tab === 'sns' && 'SNS 계정'}
                {tab === 'content' && '콘텐츠 생성'}
                {tab === 'quota' && '쿼터 관리'}
                {tab === 'analytics' && '모니터링'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'info' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">회원사 정보</h2>
              <button
                onClick={handleEditCompany}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                수정
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">회원사명</label>
                <p className="text-gray-900">{company.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <p className="text-gray-900">{company.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <p className="text-gray-900">{company.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사업자번호</label>
                <p className="text-gray-900">{company.business_number || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">산업/업종</label>
                <p className="text-gray-900">{company.industry || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">구독 플랜</label>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {company.plan_type}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LLM 제공자</label>
                <p className="text-gray-900">
                  {company.llm_provider === 'chatgpt' && 'ChatGPT (OpenAI)'}
                  {company.llm_provider === 'gemini' && 'Gemini (Google)'}
                  {company.llm_provider === 'claude' && 'Claude (Anthropic)'}
                  {!company.llm_provider && '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LLM API Key</label>
                <p className="text-gray-900">
                  {company.llm_api_key ? '••••••••••••' : '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'sns' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">SNS 계정 ({snsAccounts.length})</h2>
              <button
                onClick={handleAddSnsAccount}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + SNS 계정 추가
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snsAccounts.map((account) => {
                const platformInfo = getPlatformInfo(account.platform);
                return (
                  <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className={`h-2 w-full bg-gradient-to-r ${platformInfo.color} rounded-full mb-4`}></div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{platformInfo.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{platformInfo.name}</h3>
                        <p className="text-sm text-gray-500">@{account.account_id}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">계정명</span>
                        <span className="font-medium text-gray-900">{account.account_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">팔로워</span>
                        <span className="font-medium text-gray-900">{account.follower_count.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">게시물</span>
                        <span className="font-medium text-gray-900">{account.post_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">상태</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          account.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {account.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEditAccount(account)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-100 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="px-3 py-2 text-sm border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTab === 'content' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">콘텐츠 생성 관리</h2>
              <button
                onClick={() => setShowTopicModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + 주제 생성
              </button>
            </div>

            {contentTopics.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">주제를 생성하여 콘텐츠를 관리하세요</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    주제를 만들고 AI 프롬프트를 입력하여<br/>
                    필요한 만큼 서브 주제를 생성할 수 있습니다.
                  </p>
                  <button
                    onClick={() => setShowTopicModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    첫 주제 만들기
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {contentTopics.map((topic) => (
                  <div key={topic.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{topic.title}</h3>
                          <p className="text-sm text-gray-600">{topic.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedTopic(topic);
                              setShowSubtopicModal(true);
                            }}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                          >
                            + 서브 주제 생성
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                          >
                            삭제
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>서브 주제: {topic.subtopic_count}개</span>
                        <span>생성일: {new Date(topic.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>

                      {/* 서브 주제 목록 */}
                      {subtopics.filter(st => st.topic_id === topic.id).length > 0 && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">서브 주제</h4>
                          <div className="space-y-2">
                            {subtopics.filter(st => st.topic_id === topic.id).map((subtopic) => {
                              const isExpanded = expandedSubtopics.has(subtopic.id);
                              const totalContents = subtopic.generated_contents?.length || 0;

                              return (
                                <div key={subtopic.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                  {/* 헤더 (항상 표시) */}
                                  <div className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-medium text-gray-900">{subtopic.title}</h5>
                                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                            {subtopic.count}개 생성
                                          </span>
                                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            subtopic.auto_schedule === 'daily' ? 'bg-blue-100 text-blue-700' :
                                            subtopic.auto_schedule === 'weekly' ? 'bg-green-100 text-green-700' :
                                            subtopic.auto_schedule === 'biweekly' ? 'bg-purple-100 text-purple-700' :
                                            subtopic.auto_schedule === 'monthly' ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-100 text-gray-700'
                                          }`}>
                                            {getFrequencyLabel(subtopic.auto_schedule)}
                                            {subtopic.schedule_day && ` (${subtopic.schedule_day})`}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-2">{subtopic.prompt}</p>
                                        <div className="text-xs text-gray-500 mt-1">
                                          생성일: {new Date(subtopic.created_at).toLocaleDateString('ko-KR')}
                                          {totalContents > 0 && ` • 총 ${totalContents}개 콘텐츠`}
                                        </div>
                                      </div>
                                      <div className="ml-4 flex gap-2">
                                        {totalContents > 0 && (
                                          <button
                                            onClick={() => toggleSubtopicExpand(subtopic.id)}
                                            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                                          >
                                            {isExpanded ? '접기 ▲' : '펼치기 ▼'}
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleRepublish(subtopic, topic)}
                                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                                        >
                                          재발행
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedTopic(topic);
                                            setSelectedSubtopic(subtopic);
                                            setScheduleType(subtopic.auto_schedule);
                                            setShowSubtopicModal(true);
                                          }}
                                          className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                          수정
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSubtopic(subtopic.id, topic.id)}
                                          className="text-sm text-red-600 hover:text-red-700"
                                        >
                                          삭제
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 펼쳐진 콘텐츠 목록 */}
                                  {isExpanded && subtopic.generated_contents && subtopic.generated_contents.length > 0 && (
                                    <div className="border-t border-gray-200 bg-white p-4">
                                      <p className="text-xs font-medium text-gray-700 mb-3">📝 생성된 서브 콘텐츠 ({totalContents}개):</p>
                                      <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {subtopic.generated_contents.map((content, idx) => (
                                          <div key={content.id} className="bg-gray-50 rounded p-3 border border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                                #{idx + 1}
                                              </span>
                                              <p className="text-sm font-medium text-gray-900">{content.subtitle}</p>
                                            </div>
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{content.content}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'quota' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">월간 컨텐츠 발행 쿼터 관리</h2>
              <button
                onClick={handleAddQuota}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + 쿼터 추가
              </button>
            </div>

            {/* 현재 월 쿼터 요약 */}
            {contentQuotas.length > 0 && contentQuotas[0].month === '2025-11' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">이번 달 쿼터 현황 (2025년 11월)</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    contentQuotas[0].quota_used / contentQuotas[0].quota_limit >= 0.9
                      ? 'bg-red-100 text-red-700'
                      : contentQuotas[0].quota_used / contentQuotas[0].quota_limit >= 0.7
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {Math.round((contentQuotas[0].quota_used / contentQuotas[0].quota_limit) * 100)}% 사용
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">총 쿼터</p>
                    <p className="text-2xl font-bold text-gray-900">{contentQuotas[0].quota_limit}건</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">사용량</p>
                    <p className="text-2xl font-bold text-blue-600">{contentQuotas[0].quota_used}건</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">남은 쿼터</p>
                    <p className="text-2xl font-bold text-green-600">{contentQuotas[0].quota_limit - contentQuotas[0].quota_used}건</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">총 비용</p>
                    <p className="text-2xl font-bold text-gray-900">₩{contentQuotas[0].total_cost.toLocaleString()}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      contentQuotas[0].quota_used / contentQuotas[0].quota_limit >= 0.9
                        ? 'bg-red-500'
                        : contentQuotas[0].quota_used / contentQuotas[0].quota_limit >= 0.7
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${(contentQuotas[0].quota_used / contentQuotas[0].quota_limit) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* 쿼터 기록 테이블 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">쿼터 한도</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용량</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용률</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">건당 단가</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 비용</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contentQuotas.map((quota) => {
                    const usageRate = (quota.quota_used / quota.quota_limit) * 100;
                    return (
                      <tr key={quota.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(quota.month + '-01').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {quota.quota_limit}건
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {quota.quota_used}건
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                              <div
                                className={`h-2 rounded-full ${
                                  usageRate >= 90 ? 'bg-red-500' : usageRate >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(usageRate, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{Math.round(usageRate)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₩{quota.unit_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₩{quota.total_cost.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditQuota(quota)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteQuota(quota.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {contentQuotas.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">등록된 쿼터 정보가 없습니다.</p>
                  <button
                    onClick={handleAddQuota}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    첫 쿼터 추가하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">최근 7일 방문자 추이</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={SAMPLE_ANALYTICS}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} name="방문자" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">최근 7일 참여 통계</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={SAMPLE_ANALYTICS}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" fill="#10b981" name="좋아요" />
                  <Bar dataKey="comments" fill="#f59e0b" name="댓글" />
                  <Bar dataKey="shares" fill="#8b5cf6" name="공유" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">총 방문자</h3>
                <p className="text-3xl font-bold text-blue-600">4,150</p>
                <p className="text-xs text-green-600 mt-1">↑ 12.5% vs 지난주</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">총 좋아요</h3>
                <p className="text-3xl font-bold text-green-600">864</p>
                <p className="text-xs text-green-600 mt-1">↑ 8.3% vs 지난주</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">총 댓글</h3>
                <p className="text-3xl font-bold text-orange-600">252</p>
                <p className="text-xs text-green-600 mt-1">↑ 15.7% vs 지난주</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">평균 참여율</h3>
                <p className="text-3xl font-bold text-purple-600">6.8%</p>
                <p className="text-xs text-green-600 mt-1">↑ 2.1% vs 지난주</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SNS 계정 추가 모달 */}
      {showAddSnsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">SNS 계정 추가</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveNewSnsAccount(Object.fromEntries(formData));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">플랫폼</label>
                  <select name="platform" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="naver_blog">Naver Blog</option>
                    <option value="twitter">Twitter</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">계정명</label>
                  <input type="text" name="account_name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">계정 ID</label>
                  <input type="text" name="account_id" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSnsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SNS 계정 수정 모달 */}
      {showEditSnsModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">SNS 계정 수정</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveEditedSnsAccount(Object.fromEntries(formData));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">플랫폼</label>
                  <input
                    type="text"
                    value={getPlatformInfo(selectedAccount.platform).name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">계정명</label>
                  <input
                    type="text"
                    name="account_name"
                    defaultValue={selectedAccount.account_name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">계정 ID</label>
                  <input
                    type="text"
                    name="account_id"
                    defaultValue={selectedAccount.account_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <select name="status" defaultValue={selectedAccount.status} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditSnsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 쿼터 추가/수정 모달 */}
      {showQuotaModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowQuotaModal(false);
            setSelectedQuota(null);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedQuota ? '쿼터 정보 수정' : '새 쿼터 추가'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveQuota(Object.fromEntries(formData));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대상 월 *
                  </label>
                  <input
                    type="month"
                    name="month"
                    defaultValue={selectedQuota?.month || '2025-12'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    쿼터를 적용할 월을 선택하세요
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    월간 쿼터 한도 *
                  </label>
                  <input
                    type="number"
                    name="quota_limit"
                    defaultValue={selectedQuota?.quota_limit || 100}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    한 달 동안 발행 가능한 최대 콘텐츠 수
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    건당 단가 (원) *
                  </label>
                  <input
                    type="number"
                    name="unit_price"
                    defaultValue={selectedQuota?.unit_price || 5000}
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    콘텐츠 1건당 과금되는 금액
                  </p>
                </div>

                {selectedQuota && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">현재 사용량</span>
                      <span className="text-sm font-bold text-blue-600">{selectedQuota.quota_used}건</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">현재 총 비용</span>
                      <span className="text-sm font-bold text-gray-900">₩{selectedQuota.total_cost.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuotaModal(false);
                    setSelectedQuota(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-900"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {selectedQuota ? '저장' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 주제 생성 모달 */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">새 주제 생성</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveTopic(Object.fromEntries(formData));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">주제 제목 *</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 신제품 출시 캠페인"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">주제 설명 *</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이 주제에 대한 간단한 설명을 입력하세요"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 콘텐츠 발행 주기 관리 모달 */}
      {showSubtopicModal && selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {selectedSubtopic ? '서브 주제 수정' : '콘텐츠 발행 주기 관리'}
              </h3>
              <p className="text-sm text-gray-600">주제: <span className="font-medium">{selectedTopic.title}</span></p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveSubtopic(Object.fromEntries(formData));
            }}>
              <div className="space-y-6">
                {/* 1. 생성 개수 설정 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">1. 생성 개수 설정</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      생성 개수 *
                    </label>
                    <input
                      type="number"
                      name="count"
                      min="1"
                      max="100"
                      defaultValue={selectedSubtopic?.count || 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      프롬프트를 기반으로 자동 생성할 콘텐츠 개수 (최대 100개)
                    </p>
                  </div>
                </div>

                {/* 2. AI 프롬프트 설정 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">2. AI 프롬프트 설정</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      프롬프트 *
                    </label>
                    <textarea
                      name="prompt"
                      rows={6}
                      defaultValue={selectedSubtopic?.prompt || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="AI가 콘텐츠를 생성할 때 사용할 프롬프트를 자유롭게 입력하세요.&#10;&#10;예:&#10;- 타겟: 2030 여성&#10;- 톤앤매너: 친근하고 밝은&#10;- 핵심 메시지: 피부 개선 효과&#10;- 포함할 내용: 사용 전후 비교, 실사용 후기"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 타겟 고객, 톤앤매너, 핵심 메시지, 포함할 내용 등을 구체적으로 작성하면 더 나은 결과를 얻을 수 있습니다
                    </p>
                  </div>
                </div>

                {/* 3. 자동 발행 주기 설정 */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">3. 자동 발행 주기 설정</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        발행 주기 *
                      </label>
                      <select
                        name="auto_schedule"
                        value={scheduleType}
                        onChange={(e) => setScheduleType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="manual">수동 (직접 생성)</option>
                        <option value="daily">매일 자동 생성</option>
                        <option value="weekly">매주 자동 생성</option>
                        <option value="biweekly">격주 자동 생성</option>
                        <option value="monthly">매월 자동 생성</option>
                      </select>
                    </div>

                    {scheduleType === 'weekly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          발행 요일 *
                        </label>
                        <select
                          name="schedule_day"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="월요일">월요일</option>
                          <option value="화요일">화요일</option>
                          <option value="수요일">수요일</option>
                          <option value="목요일">목요일</option>
                          <option value="금요일">금요일</option>
                          <option value="토요일">토요일</option>
                          <option value="일요일">일요일</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          매주 선택한 요일에 자동으로 콘텐츠가 생성됩니다
                        </p>
                      </div>
                    )}

                    {scheduleType === 'biweekly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          발행 요일 *
                        </label>
                        <select
                          name="schedule_day"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="월요일">월요일</option>
                          <option value="화요일">화요일</option>
                          <option value="수요일">수요일</option>
                          <option value="목요일">목요일</option>
                          <option value="금요일">금요일</option>
                          <option value="토요일">토요일</option>
                          <option value="일요일">일요일</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          2주마다 선택한 요일에 자동으로 콘텐츠가 생성됩니다
                        </p>
                      </div>
                    )}

                    {scheduleType === 'monthly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          발행 날짜 *
                        </label>
                        <select
                          name="schedule_day"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={`${day}일`}>{day}일</option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          매월 선택한 날짜에 자동으로 콘텐츠가 생성됩니다
                        </p>
                      </div>
                    )}

                    {scheduleType === 'daily' && (
                      <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          ⏰ 매일 자동으로 콘텐츠가 생성됩니다
                        </p>
                      </div>
                    )}

                    {scheduleType === 'manual' && (
                      <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-700">
                          📝 수동 모드: 필요할 때마다 직접 콘텐츠를 생성할 수 있습니다
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubtopicModal(false);
                    setSelectedTopic(null);
                    setSelectedSubtopic(null);
                    setScheduleType('manual');
                    setLlmProvider('chatgpt');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {selectedSubtopic ? '수정' : '발행'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 회원사 정보 수정 모달 */}
      {showEditCompanyModal && company && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">회원사 정보 수정</h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveCompanyInfo(Object.fromEntries(formData));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회원사명 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={company.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={company.phone || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="010-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사업자번호
                  </label>
                  <input
                    type="text"
                    name="business_number"
                    defaultValue={company.business_number || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123-45-67890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    산업/업종
                  </label>
                  <input
                    type="text"
                    name="industry"
                    defaultValue={company.industry || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 카페, IT서비스, 제조업"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    구독 플랜 *
                  </label>
                  <select
                    name="plan_type"
                    defaultValue={company.plan_type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="free">무료</option>
                    <option value="basic">베이직</option>
                    <option value="pro">프로</option>
                    <option value="enterprise">엔터프라이즈</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LLM 제공자
                  </label>
                  <select
                    name="llm_provider"
                    defaultValue={company.llm_provider || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택 안 함</option>
                    <option value="chatgpt">ChatGPT (OpenAI)</option>
                    <option value="gemini">Gemini (Google)</option>
                    <option value="claude">Claude (Anthropic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LLM API Key
                  </label>
                  <input
                    type="password"
                    name="llm_api_key"
                    defaultValue={company.llm_api_key || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="API 키를 입력하세요"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    🔒 선택한 LLM 제공자의 API 키를 입력하세요
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditCompanyModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

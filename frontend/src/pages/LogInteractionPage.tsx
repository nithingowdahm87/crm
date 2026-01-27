import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchHcps } from '../store/hcpsSlice'
import type { AppDispatch, RootState } from '../store/store'
import {
  addMaterial,
  addSample,
  appendChatMessage,
  clearToolTrace,
  removeMaterial,
  removeSample,
  setChatDraft,
  setFormField,
  setHcpId,
  submitChatInteraction,
  submitEditInteraction,
  submitFormInteraction,
} from '../store/logInteractionSlice'

export default function LogInteractionPage() {
  const dispatch = useDispatch<AppDispatch>()
  const hcps = useSelector((s: RootState) => s.hcps.items)
  const hcpsLoading = useSelector((s: RootState) => s.hcps.loading)
  const form = useSelector((s: RootState) => s.logInteraction.form)
  const chat = useSelector((s: RootState) => s.logInteraction.chat)
  const toolTrace = useSelector((s: RootState) => s.logInteraction.toolTrace)
  const aiSuggestedFollowups = useSelector((s: RootState) => s.logInteraction.aiSuggestedFollowups)
  const saving = useSelector((s: RootState) => s.logInteraction.saving)
  const lastInteractionId = useSelector((s: RootState) => s.logInteraction.lastInteractionId)
  const error = useSelector((s: RootState) => s.logInteraction.error)

  const selectedHcp = useMemo(
    () => hcps.find((h) => h.id === form.hcpId) || null,
    [hcps, form.hcpId],
  )

  const [materialDraft, setMaterialDraft] = useState('')
  const [sampleDraft, setSampleDraft] = useState('')
  const [editPatchTopics, setEditPatchTopics] = useState('')
  const [editPatchOutcomes, setEditPatchOutcomes] = useState('')
  const [editPatchFollowups, setEditPatchFollowups] = useState('')

  useEffect(() => {
    dispatch(fetchHcps())
  }, [dispatch])

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearToolTrace())
    await dispatch(submitFormInteraction(form))
  }

  const onSubmitChat = async () => {
    const msg = chat.draft.trim()
    if (!msg) return
    dispatch(appendChatMessage({ role: 'user', content: msg }))
    dispatch(setChatDraft(''))
    await dispatch(submitChatInteraction({ message: msg, hcpId: form.hcpId }))
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f7fb', p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Log HCP Interaction
      </Typography>

      {error ? (
        <Paper elevation={0} sx={{ mb: 2, p: 1.5, border: '1px solid #ffd1d1', bgcolor: '#fff5f5', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#b42318' }}>
            {error}
          </Typography>
        </Paper>
      ) : null}

      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e6e8f0', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Interaction Details
            </Typography>

            <Box component="form" onSubmit={onSubmitForm}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <Autocomplete
                    options={hcps}
                    loading={hcpsLoading}
                    getOptionLabel={(o) => o.name}
                    value={selectedHcp}
                    onChange={(_, v) => dispatch(setHcpId(v ? v.id : null))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="HCP Name"
                        placeholder="Search or select HCP…"
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {hcpsLoading ? <div /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={5}>
                  <TextField
                    label="Date"
                    type="date"
                    value={form.date}
                    onChange={(e) => dispatch(setFormField({ key: 'date', value: e.target.value }))}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Interaction Type</FormLabel>
                    <RadioGroup
                      row
                      value={form.interactionType}
                      onChange={(e) => dispatch(setFormField({ key: 'interactionType', value: e.target.value }))}
                    >
                      <FormControlLabel value="In-person" control={<Radio size="small" />} label="In-person" />
                      <FormControlLabel value="Virtual" control={<Radio size="small" />} label="Virtual" />
                      <FormControlLabel value="Email" control={<Radio size="small" />} label="Email" />
                      <FormControlLabel value="Phone" control={<Radio size="small" />} label="Phone" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Sentiment</FormLabel>
                    <RadioGroup
                      row
                      value={form.sentiment}
                      onChange={(e) => dispatch(setFormField({ key: 'sentiment', value: e.target.value }))}
                    >
                      <FormControlLabel value="Positive" control={<Radio size="small" />} label="Positive" />
                      <FormControlLabel value="Neutral" control={<Radio size="small" />} label="Neutral" />
                      <FormControlLabel value="Negative" control={<Radio size="small" />} label="Negative" />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Topics Discussed"
                    placeholder="e.g., Product X efficacy, formulary access"
                    value={form.topics}
                    onChange={(e) => dispatch(setFormField({ key: 'topics', value: e.target.value }))}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Outcomes"
                    placeholder="e.g., HCP interested in trial, samples requested"
                    value={form.outcomes}
                    onChange={(e) => dispatch(setFormField({ key: 'outcomes', value: e.target.value }))}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Follow-up Actions"
                    placeholder="Enter next steps or tasks…"
                    value={form.followUpActions}
                    onChange={(e) =>
                      dispatch(setFormField({ key: 'followUpActions', value: e.target.value }))
                    }
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    AI Suggested Follow-ups
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {aiSuggestedFollowups.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        (Will populate after chat logging)
                      </Typography>
                    ) : (
                      aiSuggestedFollowups.map((x, idx) => (
                        <Typography key={idx} variant="body2" color="primary">
                          - {x}
                        </Typography>
                      ))
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Last interaction id: {lastInteractionId ?? '—'}
                    </Typography>
                    <Button type="submit" variant="contained" disabled={!form.hcpId || saving}>
                      Log
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e6e8f0', borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              AI Assistant
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Log interaction via chat
            </Typography>

            <Box
              sx={{
                mt: 2,
                bgcolor: '#f8fafc',
                border: '1px solid #e6e8f0',
                borderRadius: 2,
                p: 2,
                minHeight: 360,
              }}
            >
              <Stack spacing={1}>
                {chat.messages.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Log interaction details here (e.g., “Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure”) or ask for help.
                  </Typography>
                ) : (
                  chat.messages.map((m, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '90%',
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.25,
                          bgcolor: m.role === 'user' ? '#e8f0fe' : '#ffffff',
                          border: '1px solid #e6e8f0',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2">{m.content}</Typography>
                      </Paper>
                    </Box>
                  ))
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <TextField
                placeholder="Describe interaction…"
                value={chat.draft}
                onChange={(e) => dispatch(setChatDraft(e.target.value))}
                fullWidth
                size="small"
              />
              <Button variant="contained" onClick={onSubmitChat} disabled={saving}>
                Log
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tool Trace (demo proof)
            </Typography>
            <Box
              sx={{
                maxHeight: 200,
                overflow: 'auto',
                bgcolor: '#fff',
                border: '1px solid #e6e8f0',
                borderRadius: 2,
                p: 1,
              }}
            >
              {toolTrace.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No tool runs yet.
                </Typography>
              ) : (
                toolTrace.map((t, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {t.tool}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="pre"
                      sx={{ m: 0, whiteSpace: 'pre-wrap' }}
                    >
                      {JSON.stringify(t.output, null, 2)}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Edit Interaction (required tool)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last interaction id: {lastInteractionId ?? '—'}
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <TextField
                label="Patch Topics"
                value={editPatchTopics}
                onChange={(e) => setEditPatchTopics(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Patch Outcomes"
                value={editPatchOutcomes}
                onChange={(e) => setEditPatchOutcomes(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Patch Follow-up Actions"
                value={editPatchFollowups}
                onChange={(e) => setEditPatchFollowups(e.target.value)}
                size="small"
                fullWidth
              />
              <Button
                variant="outlined"
                disabled={!lastInteractionId || saving}
                onClick={async () => {
                  if (!lastInteractionId) return
                  const patch: Record<string, any> = {}
                  if (editPatchTopics.trim()) patch.topics = editPatchTopics.trim()
                  if (editPatchOutcomes.trim()) patch.outcomes = editPatchOutcomes.trim()
                  if (editPatchFollowups.trim()) patch.follow_up_actions = editPatchFollowups.trim()
                  await dispatch(submitEditInteraction({ interactionId: lastInteractionId, patch }))
                }}
              >
                Run Edit Tool
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
